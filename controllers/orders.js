import { db } from "../db.js";

export const createOrder = async (req, res) => {
  const { userId, items, total } = req.body;
  try {
    const [orderResult] = await db.execute(
      "INSERT INTO orders (user_id, total) VALUES (?, ?)",
      [userId, total]
    );
    const orderId = orderResult.insertId;

    const promises = items.map(item => {
      return db.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, item.price]
      );
    });
    await Promise.all(promises);

    res.json({ message: "Commande créée", orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const [orders] = await db.execute("SELECT * FROM orders WHERE user_id=?", [userId]);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
