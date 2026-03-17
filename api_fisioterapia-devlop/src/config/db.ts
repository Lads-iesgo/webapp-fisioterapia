// filepath: d:\Lads\api_fisioterapia\src\config\db.ts
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // Carrega as variáveis de ambiente do .env

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10, // Limite de conexões no pool
  queueLimit: 0, // Sem limite na fila de espera por conexões
});

// Testa a conexão
pool
  .getConnection()
  .then((connection) => {
    console.log("Conectado ao banco de dados MySQL com sucesso!");
    connection.release(); // Libera a conexão de volta para o pool
  })
  .catch((err) => {
    console.error("Erro ao conectar ao banco de dados MySQL:", err);
    // Em um cenário real, você pode querer encerrar a aplicação ou tentar reconectar
    // process.exit(1);
  });

export default pool;
