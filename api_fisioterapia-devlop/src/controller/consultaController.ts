import pool from "../config/db";

import { ConsultaInterface } from "../interfaces/types";

import { Request, Response, NextFunction } from "express";

export const getConsulta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [rows] = await pool.query("SELECT * FROM consulta");
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

export const getConsultaById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows]: any = await pool.query(
      "SELECT * FROM consulta WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: "Consulta não encontrada" });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const createConsulta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let {
      paciente_id,
      data_consulta,
      horario_id,
      fisioterapeuta_id,
    }: ConsultaInterface = req.body;

    // Converte para 'YYYY-MM-DD' se vier no formato ISO
    if (typeof data_consulta === "string" && data_consulta.includes("T")) {
      data_consulta = data_consulta.split("T")[0];
    }

    const [result]: any = await pool.query(
      "INSERT INTO consulta (paciente_id, data_consulta, horario_id, fisioterapeuta_id) VALUES (?, ?, ?, ?)",
      [paciente_id, data_consulta, horario_id, fisioterapeuta_id]
    );

    const newConsulta: ConsultaInterface = {
      id: result.insertId,
      paciente_id,
      data_consulta,
      horario_id,
      fisioterapeuta_id,
    };

    res.status(201).json(newConsulta);
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        message:
          "Já existe uma consulta para esse paciente, data, horário e fisioterapeuta.",
      });
      return;
    }
    next(error);
  }
};

export const updateConsulta = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const campos = [
      "paciente_id",
      "data_consulta",
      "horario_id",
      "fisioterapeuta_id",
      "status",
    ];

    // Monta dinamicamente os campos a serem atualizados
    const updates = [];
    const values = [];
    for (const campo of campos) {
      if (req.body[campo] !== undefined) {
        updates.push(`${campo} = ?`);
        values.push(req.body[campo]);
      }
    }

    if (updates.length === 0) {
      res.status(400).json({ message: "Nenhum campo para atualizar." });
      return;
    }

    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE consulta SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Consulta não encontrada" });
      return;
    }

    res.status(200).json({ id, ...req.body });
  } catch (error) {
    next(error);
  }
};

export const deleteConsulta = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    const [result]: any = await pool.query(
      "DELETE FROM consulta WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Consulta não encontrada" });
      return;
    }

    res.status(200).json({ message: "Consulta excluída com sucesso" });
  } catch (error) {
    next(error);
  }
};
