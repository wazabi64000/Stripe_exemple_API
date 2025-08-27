import express from "express";
import { db } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Créer une commande et session Stripe
router.post("/", authenticate, async (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: "Panier vide" });

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  try {
    // Créer commande dans DB
    const [orderResult] = await db.execute(
      "INSERT INTO orders (user_id, total) VALUES (?, ?)",
      [req.userId, total]
    );
    const orderId = orderResult.insertId;

    // Ajouter items
    for (const item of items) {
      await db.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, item.price]
      );
    }

    // Créer session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(i => ({
        price_data: {
          currency: 'eur',
          product_data: { name: i.name },
          unit_amount: Math.round(i.price * 100),
        },
        quantity: i.quantity
      })),
      mode: 'payment',
      success_url: `http://localhost:3000/api/orders/success?orderId=${orderId}`,
      cancel_url: `http://localhost:3000/api/orders/cancel`
    });

    res.json({ orderId, stripeUrl: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Success / cancel pour simulation
router.get("/success", (req, res) => {
  res.send(`Paiement réussi pour la commande ${req.query.orderId}`);
});
router.get("/cancel", (req, res) => {
  res.send("Paiement annulé");
});

export default router;
