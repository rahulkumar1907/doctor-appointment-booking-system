import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.mjs";

dotenv.config();
const PORT = 3000;
const app = express();

app.use(express.json());
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
