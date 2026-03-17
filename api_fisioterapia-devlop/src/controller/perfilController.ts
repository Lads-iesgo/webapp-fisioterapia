import pool from "../config/db";

import { PerfilInterface } from "../interfaces/types";

import { Request, Response, NextFunction } from "express";

export const getPerfil = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [rows] = await pool.query("SELECT * FROM perfil");
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

export const getPerfilById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows]: any = await pool.query("SELECT * FROM perfil WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      res.status(404).json({ message: "Perfil não encontrado" });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const createPerfil = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nome }: PerfilInterface = req.body;

    const [result]: any = await pool.query(
      "INSERT INTO perfil (nome) VALUES (?)",
      [nome]
    );

    const newPerfil: PerfilInterface = {
      id: result.insertId,
      nome,
    };

    res.status(201).json(newPerfil);
  } catch (error) {
    next(error);
  }
};

export const updatePerfil = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nome } = req.body;

    if (!nome) {
      res
        .status(400)
        .json({ message: "O campo nome é obrigatório para atualização." });
      return;
    }

    const [result]: any = await pool.query(
      "UPDATE perfil SET nome = ? WHERE id = ?",
      [nome, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Perfil não encontrado" });
      return;
    }

    res.status(200).json({ id, nome });
  } catch (error) {
    next(error);
  }
};
