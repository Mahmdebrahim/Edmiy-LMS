import express from "express";
import cors from "cors";
import connectDB from "./configs/mongodb.js";
import { connectCloudinary } from "./configs/cloudinary.js";
import "dotenv/config";
import { clerkWebhooks,stripeWebhooks } from "./controllers/webhooks.js";
import { clerkMiddleware } from "@clerk/express";
import educatorRoutes from "./routes/educatorRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
const app = express();

await connectDB();
await connectCloudinary();

app.use(
  cors({
    origin: "http://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.post("/clerk", express.raw({ type: "*/*" }), clerkWebhooks);
app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// ✅ باقي الـ routes بعد كده
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("Hello Api!"));
app.use("/api/educator", educatorRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/user", userRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
