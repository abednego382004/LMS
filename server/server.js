import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks, stripeWebhooks } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/cloudinary.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoutes.js";
const app = express();

await connectDB();
await connectCloudinary();

app.use(cors());

app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);
app.post("/clerk", clerkWebhooks);

app.get("/", (req, res) => {
  res.send("API is working");
});

app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
