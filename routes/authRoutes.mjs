import express from "express";
const router = express.Router();
import { registerUser } from "../controller/userController.mjs";
import { createDoctor } from "../controller/doctorController.mjs";

router.post("/register", registerUser);
router.post("/add-doctor", createDoctor);

export default router;
