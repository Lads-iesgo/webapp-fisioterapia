import express, { Request, Response, NextFunction } from "express";
const cors = require("cors");
import mysql from "mysql2/promise";

import userRoutes from "./user.routes";
import clientRoutes from "./paciente.routes";
import perfilRoutes from "./perfil.routes";
import consultaRoutes from "./consulta.routes";
import horarioRoutes from "./horario.routes";
import authRoutes from "./auth.routes";
import registerRoutes from "./register.routes";

if (!process.env.JWT_SECRET) {
  throw new Error("A variável de ambiente JWT_SECRET não está definida.");
}
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_DATABASE || !process.env.DB_PORT) {
  throw new Error("As variáveis de ambiente do banco de dados não estão configuradas corretamente.");
}

const app = express();

app.use(express.json());
app.use(cors());

// Adiciona uma rota para a raiz
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "API Fisioterapia está funcionando!" });
});

app.use("/usuario", userRoutes);
app.use("/paciente", clientRoutes); // Exemplo para rotas de paciente
app.use("/perfil", perfilRoutes);
app.use("/consulta", consultaRoutes);
app.use("/horario", horarioRoutes);
app.use("/auth", authRoutes); // Certifique-se de que esta linha está presente
app.use("/register", registerRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({ message: err.message || "Internal Server Error" });
});

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: Number(process.env.DB_PORT),
    });
    console.log("Conexão com o banco de dados bem-sucedida!");
    connection.end();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao conectar ao banco de dados:", error.message);
    } else {
      console.error("Erro ao conectar ao banco de dados:", error);
    }
    process.exit(1);
  }
})();

export default app;
