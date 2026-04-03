# WebApp de Fisioterapia

Este projeto é um aplicativo web desenvolvido com **Next.js** e **TypeScript**, destinado a auxiliar o curso de fisioterapia com seus pacientes.

## Repositório Git

O código-fonte deste projeto está hospedado no GitHub: [https://github.com/Lads-iesgo/webapp-fisioterapia.git](https://github.com/Lads-iesgo/webapp-fisioterapia.git)

## Tecnologias Utilizadas

- **Next.js:** Framework React para desenvolvimento de aplicações web modernas.
- **TypeScript:** Superset de JavaScript que adiciona tipagem estática.
- **Node.js:** Ambiente de tempo de execução JavaScript.
- **npm (ou Yarn):** Gerenciador de pacotes JavaScript.
- **Git:** Sistema de controle de versão distribuído.

## Pré-requisitos

- **Node.js:** Certifique-se de ter o Node.js instalado em sua máquina. Você pode baixá-lo em [https://nodejs.org/](https://nodejs.org/).
- **Git:** Certifique-se de ter o Git instalado em sua máquina. Você pode baixá-lo em [https://git-scm.com/](https://git-scm.com/).

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
┣ 📂 public/           # Arquivos estáticos (imagens, fontes, etc.)
┣ 📂 app/              # Estrutura principal do Next.js
┃ ┣ 📂 components/     # Componentes reutilizáveis
┃ ┣ 📂 styles/         # Estilos globais
┃ ┗ 📜 page.tsx        # Página principal do aplicativo
┣ 📜 package.json      # Dependências do projeto
┣ 📜 tsconfig.json     # Configuração do TypeScript
┗ 📜 README.md         # Documentação do projeto
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

## Dicas adicionais

- Escreva mensagens de commit claras e concisas.
- Mantenha o PR o menor e mais focado possível.
- Comunique-se de forma eficaz com os revisores.

## Contato

- [lads@iesgo.edu.br](mailto:lads@iesgo.edu.br)
