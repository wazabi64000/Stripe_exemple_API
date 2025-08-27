// backend/routes/cart.js
import express from "express";
import { db } from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Récupérer le panier (depuis cookie)
router.get("/", (req, res) => {
  const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
  res.json(cart);
});

// Ajouter un produit au panier
router.post("/", (req, res) => {
  const { id, name, price } = req.body;
  let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity++;
    existing.total = existing.price * existing.quantity;
  } else {
    cart.push({ id, name, price, quantity: 1, total: price });
  }

  // Stocker le panier dans cookie (7 jours)
  res.cookie("cart", JSON.stringify(cart), { httpOnly: true, maxAge: 7*24*60*60*1000 });
  res.json(cart);
});

// Passer commande (uniquement si connecté)
router.post("/checkout", authenticate, async (req, res) => {
  try {
    // Récupérer le panier depuis les cookies
    const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
    if (!cart.length) return res.status(400).json({ error: "Panier vide" });

    // Calculer le total de la commande (prix * quantité)
    const total = cart.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

    if (total <= 0) return res.status(400).json({ error: "Total invalide" });

    // Créer la commande dans la base de données
    const [orderResult] = await db.execute(
      "INSERT INTO orders (user_id, total) VALUES (?, ?)",
      [req.userId, total]
    );
    const orderId = orderResult.insertId;

    // Ajouter les produits de la commande
    for (const item of cart) {
      const price = Number(item.price || 0);
      const quantity = Number(item.quantity || 0);

      if (price > 0 && quantity > 0) {
        await db.execute(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
          [orderId, item.id, quantity, price]
        );
      }
    }

    // Vider le panier
    res.clearCookie("cart");

    // Répondre avec succès
    res.status(200).json({ message: "Commande réussie", orderId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
