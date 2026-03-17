import pool from "../config/db";

import { PacienteInterface } from "../interfaces/types";

import { Request, Response, NextFunction } from "express";

export const getPaciente = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [rows] = await pool.query("SELECT * FROM paciente");
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

export const getPacienteById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows]: any = await pool.query(
      "SELECT * FROM paciente WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: "Paciente não encontrado" });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const createPaciente = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      nome_completo,
      email,
      telefone,
      genero,
      data_nascimento,
      cpf,
      cep,
      endereco,
    }: PacienteInterface = req.body;

    const [result]: any = await pool.query(
      "INSERT INTO paciente (nome_completo, email, telefone, genero, data_nascimento, cpf, cep, endereco) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        nome_completo,
        email,
        telefone,
        genero,
        data_nascimento,
        cpf,
        cep,
        endereco,
      ]
    );

    const newPaciente: PacienteInterface = {
      id: result.insertId,
      nome_completo,
      email,
      telefone,
      genero,
      data_nascimento,
      cpf,
      cep,
      endereco,
    };

    res.status(201).json(newPaciente);
  } catch (error) {
    next(error);
  }
};

export const updatePaciente = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const campos = [
      "nome_completo",
      "email",
      "telefone",
      "genero",
      "data_nascimento",
      "cpf",
      "cep",
      "endereco",
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
      `UPDATE paciente SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Paciente não encontrado" });
      return;
    }

    res.status(200).json({ id, ...req.body });
  } catch (error) {
    next(error);
  }
};
