import express from "express";
import { login } from "../controller/authController";

const router = express.Router();

// Rota de login
router.post("/login", login);

export default router;