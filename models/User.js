import { db } from "../db.js";

export const createUser = async (email, password) => {
  const [result] = await db.execute(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password]
  );
  return result.insertId;
};

export const findUserByEmail = async (email) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE id = ?",
    [id]
  );
  return rows[0];
};
