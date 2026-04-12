# WebApp de Fisioterapia

Aplicação web do sistema de fisioterapia, construída com Next.js e TypeScript, com autenticação, proteção de rotas por perfil e módulos para agenda e cadastros.

## Repositório Git

O código-fonte deste projeto está hospedado no GitHub: [https://github.com/Lads-iesgo/webapp-fisioterapia.git](https://github.com/Lads-iesgo/webapp-fisioterapia.git)

## Tecnologias Utilizadas

- **Next.js 16**: framework principal da aplicação.
- **React 19** e **React DOM 19**: interface e renderização.
- **TypeScript 5**: tipagem estática.
- **Tailwind CSS 4** + **PostCSS** + **Autoprefixer**: estilização.
- **Axios**: comunicação HTTP com a API.
- **FullCalendar**: calendário de consultas e disponibilidade.
- **Headless UI** e **Heroicons**: componentes e ícones de interface.
- **next-client-cookies**: suporte a cookies no app router.
- **ESLint 9** + **eslint-config-next**: padronização de código.

## Pré-requisitos

- **Node.js 20+** (recomendado)
- **npm 10+**
- **Git**

## Scripts Disponíveis

- `npm run dev`: inicia a aplicação em modo desenvolvimento.
- `npm run build`: gera build de produção.
- `npm run start`: sobe a aplicação em modo produção.
- `npm run lint`: executa análise estática com ESLint.

## Configuração do Projeto

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/Lads-iesgo/webapp-fisioterapia.git
   cd webapp-fisioterapia
   ```

2. **Instale as dependências:**

   ```bash
   npm install # ou yarn install
   ```

3. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

   Este comando inicia o servidor de desenvolvimento Next.js. Abra [http://localhost:3000](http://localhost:3000) no navegador para visualizar o aplicativo.

## Estrutura do Projeto

```
📦 webapp-fisioterapia
┣ 📂 public/
┣ 📂 src/
┃ ┣ 📜 proxy.ts                        # Proteção de rotas no nível do Next
┃ ┗ 📂 app/
┃   ┣ 📂 components/                   # Contextos, guardas e componentes base
┃   ┣ 📂 services/                     # Camada de API
┃   ┣ 📂 interfaces/                   # Tipagens compartilhadas
┃   ┣ 📂 lib/                          # Permissões e utilitários
┃   ┣ 📂 login/                        # Tela de autenticação
┃   ┣ 📂 home/                         # Visão principal para perfis de leitura
┃   ┣ 📂 disponibilidade/              # Agenda e gestão de disponibilidade
┃   ┣ 📂 cadastroPaciente/
┃   ┣ 📂 cadastroUsuario/
┃   ┣ 📂 cadastroConsulta/
┃   ┣ 📜 layout.tsx
┃   ┣ 📜 page.tsx
┃   ┗ 📜 globals.css
┣ 📜 package.json
┣ 📜 tsconfig.json
┗ 📜 README.md
```

## Branches

- **main:** Branch principal para versões estáveis.
- **develop:** Branch para desenvolvimento em andamento.

## Contribuindo

Para contribuir com o projeto, siga estes passos:

1. **Crie uma nova branch a partir da `develop`:**

   ```bash
   git checkout develop
   git checkout -b sua-nova-branch
   ```

2. **Faça suas alterações e commits:**

   ```bash
   git add .
   git commit -m "Descrição das suas alterações"
   ```

3. **Envie suas alterações para o GitHub:**

   ```bash
   git push origin sua-nova-branch
   ```

4. **Crie um Pull Request (PR) para a branch `develop`.**

## Próximos Passos

### Criando um Pull Request (PR) para a branch `develop`

Um Pull Request (PR) é uma solicitação para mesclar suas alterações da sua branch para a branch `develop`. Isso permite que outros colaboradores revisem seu código e garantam que ele se encaixe no projeto. Siga estes passos para criar um PR:

1. **Verifique suas alterações:**
   - Certifique-se de que suas alterações estejam completas e funcionando corretamente.
   - Use `git status` para verificar as alterações pendentes e `git diff` para revisar as modificações.

2. **Envie sua branch para o GitHub:**

   ```bash
   git push origin sua-nova-branch
   ```

3. **Crie o Pull Request no GitHub:**
   - Acesse o repositório do projeto no GitHub.
   - Clique na aba "Pull requests".
   - Clique no botão "New pull request".
   - Selecione sua branch como a branch de origem e `develop` como a branch de destino.
   - Adicione um título descritivo e uma descrição detalhada para o PR.
   - Clique no botão "Create pull request".

4. **Acompanhe a revisão:**
   - Aguarde a revisão do seu PR por outros colaboradores.
   - Responda aos comentários e faça as alterações necessárias.
   - Após a aprovação, o PR poderá ser mesclado na branch `develop`.

## Ambiente e Integração

- O frontend depende da API backend para autenticação e dados de agenda/cadastros.
- A proteção de rotas é feita em duas camadas:
  - via proxy (token em cookie);
  - via guarda de rota por perfil no cliente.
- Garanta que o backend esteja ativo para validar os fluxos principais do sistema.

## Dicas adicionais

- Escreva mensagens de commit claras e concisas.
- Mantenha o PR o menor e mais focado possível.
- Comunique-se de forma eficaz com os revisores.

## Contato

lads@iesgo.edu.br
