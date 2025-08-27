import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const userId = await createUser(email, hashed);
  res.json({ message: "Utilisateur créé", userId });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Mot de passe incorrect" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
};
