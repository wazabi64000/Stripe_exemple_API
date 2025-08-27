import express from "express";
import cookieParser from "cookie-parser";
import Stripe from "stripe";
import { authenticate } from "../middleware/auth.js";
import { db } from "../db.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-26" });

// Middlewares globaux pour ce router
router.use(express.json());       // Pour parser JSON
router.use(cookieParser());       // Pour parser les cookies

// Créer un PaymentIntent
router.post("/", authenticate, async (req, res) => {
  try {
    const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
    if (!cart.length) return res.status(400).json({ error: "Panier vide" });

    const total = cart.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

    if (total <= 0) return res.status(400).json({ error: "Total invalide" });

    const amountInCents = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      metadata: {
        userId: String(req.userId ?? ""), // Forcer string
        cart: JSON.stringify(cart),
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook Stripe pour confirmer les paiements
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error( "Webhook signature mismatch.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    try {
      const userId = paymentIntent.metadata?.userId ?? null;
      const cart = paymentIntent.metadata?.cart ? JSON.parse(paymentIntent.metadata.cart) : [];
      
      if (!userId) return console.warn("⚠️ userId manquant dans metadata");
      if (!cart.length) return console.warn("⚠️ Panier vide dans metadata");

      const total = cart.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );

      const [orderResult] = await db.execute(
        "INSERT INTO orders (user_id, total) VALUES (?, ?)",
        [userId, total ?? 0]
      );
      const orderId = orderResult.insertId;

      for (const item of cart) {
        const productId = item.id ?? null;
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);

        if (productId && price > 0 && quantity > 0) {
          await db.execute(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
            [orderId, productId, quantity, price]
          );
        } else {
          console.warn("Item ignoré car invalide :", item);
        }
      }

      console.log(`✅ Commande ${orderId} créée pour l'utilisateur ${userId}`);
    } catch (err) {
      console.error("Erreur lors de l'insertion de la commande :", err);
    }
  }

  res.json({ received: true });
});

export default router;
