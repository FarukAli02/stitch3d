import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authroutes from "./routes/authroute.js"; // ✅ Correct path
dotenv.config();
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
// ✅ This mounts all routes like /api/auth/signup, /api/auth/verify-code, etc.
app.use("/api/auth", authroutes);
app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
