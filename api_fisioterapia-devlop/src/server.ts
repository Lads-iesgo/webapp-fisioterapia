import * as dotenv from "dotenv";
dotenv.config(); // Garanta que isso seja chamado antes de qualquer código que use process.env

import app from "./routes/app";
// A conexão com o banco é inicializada quando o módulo db.ts é carregado,
// o que acontece quando os controllers são importados pelo app.ts.

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor está rodando em http://localhost:${PORT}`);
  // A mensagem de conexão com o banco de dados do db.ts deve aparecer antes desta se tudo estiver correto.
});
