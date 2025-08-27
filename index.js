import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import cartRoutes from "./routes/cart.js";
import payment from "./routes/payment.js";
import cookieParser from "cookie-parser";
import Stripe from "stripe";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
 
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/payment" , payment)


app.listen(3000, () => console.log("API running on http://localhost:3000"));
