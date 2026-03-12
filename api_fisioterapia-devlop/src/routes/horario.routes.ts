import express from "express";
import {
  getHorario,
  getHorarioById,
  createHorario,
  updateHorario,
} from "../controller/horarioController";

const router = express.Router();

//Rotas Perfil
router.get("/", getHorario); // GET /horario
router.get("/:id", getHorarioById); // GET horario/:id
router.post("/", createHorario); // POST /horario
router.put("/:id", updateHorario); // PUT /horario/:id

export default router;
