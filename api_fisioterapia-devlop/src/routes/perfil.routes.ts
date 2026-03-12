import express from "express";
import {
  getPerfil,
  getPerfilById,
  createPerfil,
  updatePerfil,
} from "../controller/perfilController";

const router = express.Router();

//Rotas Perfil
router.get("/", getPerfil); // GET /perfil
router.get("/:id", getPerfilById); // GET perfil/:id
router.post("/", createPerfil); // POST /perfil
router.put("/:id", updatePerfil); // PUT /perfil/:id

export default router;
