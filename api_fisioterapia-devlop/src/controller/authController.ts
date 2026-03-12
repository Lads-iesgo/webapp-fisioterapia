import pool from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, senha } = req.body;

    // Verifica se o usuário existe no banco de dados e busca nome e perfil_id
    const [rows]: any = await pool.query(
      "SELECT * FROM usuario WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({ // Alterado para 401 para não revelar se o email existe ou não
        status: "error",
        message: "Usuário ou senha inválido.",
      });
      return;
    }

    const usuario = rows[0];

    // Verifica se a senha está correta
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      res.status(401).json({
        status: "error",
        message: "Usuário ou senha inválido.",
      });
      return;
    }

    // Busca o nome do perfil (role)
    let nomePerfil = 'Desconhecido'; // Valor padrão caso não encontre
    if (usuario.perfil_id) {
      const [perfilRows]: any = await pool.query(
        "SELECT nome FROM perfil WHERE id = ?",
        [usuario.perfil_id]
      );
      if (perfilRows.length > 0) {
        nomePerfil = perfilRows[0].nome;
      }
    }

    // Gera um token JWT com id e role
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET não está definido no .env!");
      // Resposta de erro genérica para evitar vazamento de informações
      // Evita expor detalhes técnicos ao usuário final
      res.status(500).json({
        status: "error",
        message: "Erro interno do servidor: configuração de autenticação ausente.",
      });
      return;
    }

    const tokenPayload = {
      id: usuario.id, // ID do usuário
      role: nomePerfil, // Nome do perfil (role) do usuário
    };

    const token = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: "1h", // Token expira em 1 hora
    });

    res.status(200).json({
      status: "success",
      message: "Login bem-sucedido!",
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome_completo, 
        perfil: nomePerfil,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error); // Log do erro para depuração
    // Evita passar o objeto de erro diretamente para o cliente em produção por segurança
    res.status(500).json({
        status: "error",
        message: "Ocorreu um erro durante o login. Por favor, tente novamente."
    });
    // Se você tiver um middleware de tratamento de erros configurado, pode usar next(error)
    // next(error); 
  }
};