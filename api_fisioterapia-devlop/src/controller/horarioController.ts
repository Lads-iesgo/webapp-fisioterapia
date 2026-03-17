import pool from "../config/db";

import { HorarioInterface } from "../interfaces/types";

import { Request, Response, NextFunction } from "express";

export const getHorario = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [rows] = await pool.query("SELECT * FROM horario_agendamento");
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

export const getHorarioById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows]: any = await pool.query(
      "SELECT * FROM horario_agendamento WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: "Horário não encontrado" });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const createHorario = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { horario }: HorarioInterface = req.body;

    const [result]: any = await pool.query(
      "INSERT INTO horario_agendamento (horario) VALUES (?)",
      [horario]
    );

    const newHorario: HorarioInterface = {
      id: result.insertId,
      horario,
    };

    res.status(201).json(newHorario);
  } catch (error) {
    next(error);
  }
};

export const updateHorario = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { horario } = req.body;

    if (!horario) {
      res
        .status(400)
        .json({ message: "O campo horãrio é obrigatório para atualização." });
      return;
    }

    const [result]: any = await pool.query(
      "UPDATE horario_agendamento SET horario = ? WHERE id = ?",
      [horario, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Horãrio não encontrado" });
      return;
    }

    res.status(200).json({ id, horario });
  } catch (error) {
    next(error);
  }
};
