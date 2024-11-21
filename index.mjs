import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const PORT = 3000;
const app = express();

app.use(express.json());
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
