import express from "express";
import {
  getConsulta,
  getConsultaById,
  createConsulta,
  updateConsulta,
  deleteConsulta,
} from "../controller/consultaController";

const router = express.Router();

//Rotas Perfil
router.get("/", getConsulta); // GET /consulta
router.get("/:id", getConsultaById); // GET consulta/:id
router.post("/", createConsulta); // POST /consulta
router.put("/:id", updateConsulta); // PUT /consulta/:id
router.delete("/:id", deleteConsulta); // DELETE /consulta/:id

export default router;
