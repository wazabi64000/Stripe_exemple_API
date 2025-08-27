import express from "express";
import { db } from "../db.js";

const router = express.Router();

// Lister tous les produits
router.get("/", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM products");
  res.json(rows);
});

// Ajouter un produit
router.post("/", async (req, res) => {
  const { name, price, description } = req.body;
  const [result] = await db.execute(
    "INSERT INTO products (name, price, description) VALUES (?, ?, ?)",
    [name, price, description || ""]
  );
  res.json({ message: "Produit ajouté", id: result.insertId });
});

export default router;
