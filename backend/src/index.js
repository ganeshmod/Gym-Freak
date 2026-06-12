import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { MongoDB } from "./utils/database.connection.js";
import cors from "cors";
import Router from "./routes/auth.routes.js";
import ProductRouter from "./routes/product.routes.js";
import CartRouter from "./routes/cart.routes.js";
import PaymentRouter from "./routes/payment.routes.js";
import UserRouter from "./routes/user.routes.js";
import ReviewRouter from "./routes/review.routes.js";
import OrderRouter from "./routes/order.routes.js";

// ----## Basic Connections ##----
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://www.gymfreak.store",
  "https://gymfreak.store",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        console.log("✅ CORS allowed for:", origin);
        cb(null, true);
      } else {
        console.error("❌ Blocked by CORS:", origin);
        cb(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cookieParser());
MongoDB();

app.get("/", (req, res) => {
  res.send("YOOO !");
});
app.use("/api/auth", Router);
app.use("/api/product", ProductRouter);
app.use("/api/cart", CartRouter);
app.use("/api/payment", PaymentRouter);
app.use("/api/user", UserRouter);
app.use("/api/review", ReviewRouter);
app.use("/api/order", OrderRouter);

app.listen(PORT, () => {
  console.log("Server running on 8080");
});
