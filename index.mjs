import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.mjs";
import authRoutes from "./routes/authRoutes.mjs";
import appointmentRoutes from "./routes/appointmentRoutes.mjs";

dotenv.config();
const PORT = 3000;
const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api", authRoutes);
app.use("/api", appointmentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
