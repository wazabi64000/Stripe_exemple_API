import { db } from "../db.js";

export const createOrder = async (userId, total) => {
  const [result] = await db.execute(
    "INSERT INTO orders (user_id, total) VALUES (?, ?)",
    [userId, total]
  );
  return result.insertId;
};

export const addOrderItem = async (orderId, productId, quantity, price) => {
  await db.execute(
    "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
    [orderId, productId, quantity, price]
  );
};

export const getOrdersByUserId = async (userId) => {
  const [rows] = await db.execute("SELECT * FROM orders WHERE user_id = ?", [userId]);
  return rows;
};
