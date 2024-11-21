import express from "express";
const router = express.Router();
import { registerUser,loginUser, regenerateAccessToken } from "../controller/userController.mjs";
import { createDoctor } from "../controller/doctorController.mjs";

router.post("/register", registerUser);
router.post("/add-doctor", createDoctor);
router.post("/login", loginUser);
router.post("/regenerate-access", regenerateAccessToken);

export default router;
