# Implementação de Controle de Acesso Baseado em Roles (RBAC)

## Resumo das Alterações

Este documento descreve as melhorias implementadas no sistema de controle de acesso baseado em roles, com foco especial na restrição de acesso para usuários com perfil de **aluno**.

## Objetivos Alcançados

### 1. Verificação de Token e Role de Aluno ✅

- **Middleware Aprimorado** (`src/middleware.ts`):
  - Validação robusta de token JWT com verificação de campos obrigatórios (role, email, id)
  - Redirecionamento de alunos que tentam acessar páginas restritas
  - Parâmetros de query para informar o motivo do redirecionamento
  - Limpeza automática de tokens inválidos ou expirados

- **Validação no Cliente** (`src/app/utils/auth.ts`):
  - Verificação de campos obrigatórios no token
  - Melhor tratamento de erros de decodificação
  - Logging detalhado de problemas de autenticação

### 2. Notificações de Erro com Componente Notification.tsx ✅

- **Página Home** (`src/app/home/page.tsx`):
  - Detecta redirecionamentos por falta de permissão via query parameters
  - Mostra notificação de erro clara e específica
  - Informa qual página o usuário tentou acessar
  - Verifica autenticação antes de fazer chamadas à API

- **Páginas Protegidas** (cadastroPaciente, cadastroUsuario, cadastroConsulta):
  - Verificação client-side do role do usuário
  - Notificação de erro automática para alunos
  - Redirecionamento automático para home após 2 segundos
  - Mensagem clara sobre a restrição de acesso

- **Página de Login** (`src/app/login/page.tsx`):
  - Notificações específicas para diferentes cenários:
    - Token inválido ou expirado
    - Ausência de token
    - Sessão expirada
    - Permissão negada

### 3. Navegação Baseada em Roles ✅

- **NavBar** (`src/app/components/navBar.tsx`):
  - Links de cadastro visíveis apenas para professor, coordenador e admin
  - Mensagem informativa para alunos explicando restrições
  - Interface adaptativa baseada no perfil do usuário

### 4. Correção de Problemas de Inicialização ✅

- **Verificação de Autenticação antes de Chamadas API**:
  - Evita erros quando o sistema inicia sem token válido
  - Logging claro quando autenticação não está disponível
  - Tratamento específico de erros 401 (não autenticado)

## Fluxo de Controle de Acesso

### Para Alunos:

1. **Login**: Aluno faz login e recebe token JWT com `role: "aluno"`
2. **Home**: Acesso permitido, mostra calendário de consultas
3. **Disponibilidade**: Acesso permitido
4. **Tentativa de Acesso Restrito**:
   - Middleware intercepta a requisição
   - Valida token e verifica role
   - Redireciona para `/home?accessDenied=true&attemptedRoute=/cadastroPaciente`
   - Home mostra notificação de erro
5. **NavBar**: Links de cadastro não são exibidos

### Para Professor/Coordenador/Admin:

1. **Login**: Usuário faz login e recebe token JWT com role apropriado
2. **Acesso Total**: Pode acessar todas as páginas
3. **NavBar**: Todos os links visíveis

## Mensagens de Erro Implementadas

### Middleware → Home
```
"Acesso negado! Você não tem permissão para acessar [nome da página]. 
Apenas usuários com perfil de Professor, Coordenador ou Admin podem acessar esta página."
```

### Cliente → Páginas Protegidas
```
"Acesso negado! Alunos não têm permissão para cadastrar [pacientes/usuários/consultas]."
```

### Login
```
- "Seu token de autenticação é inválido ou expirou. Por favor, faça login novamente."
- "Por favor, faça login para acessar esta página."
- "Sua sessão expirou. Por favor, faça login novamente."
```

### API Errors
```
- "Não foi possível carregar as consultas. Tente novamente mais tarde."
- "Erro ao carregar alguns dados. Algumas informações podem estar incompletas."
- "Sua sessão expirou. Por favor, faça login novamente."
```

## Arquivos Modificados

1. **src/middleware.ts**
   - Validação aprimorada de token
   - Query parameters para feedback de erro

2. **src/app/utils/auth.ts**
   - Validação de campos obrigatórios
   - Melhor tratamento de erros

3. **src/app/home/page.tsx**
   - Detecção de access denied
   - Verificação de autenticação antes de API calls
   - Notificações contextuais

4. **src/app/cadastroPaciente/page.tsx**
   - Verificação client-side de role
   - Notificação e redirecionamento automático

5. **src/app/cadastroUsuario/page.tsx**
   - Verificação client-side de role
   - Notificação e redirecionamento automático

6. **src/app/cadastroConsulta/page.tsx**
   - Verificação client-side de role
   - Notificação e redirecionamento automático

7. **src/app/login/page.tsx**
   - Tratamento de query parameters
   - Notificações específicas por cenário

8. **src/app/components/navBar.tsx**
   - Navegação baseada em roles
   - Mensagem informativa para alunos

## Benefícios da Implementação

1. **Segurança**: Múltiplas camadas de verificação (middleware + cliente)
2. **UX Melhorada**: Mensagens claras e específicas
3. **Prevenção de Erros**: Validação robusta de tokens
4. **Feedback Visual**: NavBar adaptativo ao role do usuário
5. **Manutenibilidade**: Código organizado e bem documentado

## Testes Recomendados

1. Login como aluno e tentar acessar páginas de cadastro
2. Verificar se notificações aparecem corretamente
3. Confirmar que links restritos não aparecem na NavBar para alunos
4. Testar expiração de token
5. Verificar comportamento com token inválido
6. Confirmar que professor/coordenador/admin tem acesso completo

## Notas Técnicas

- Sistema usa JWT para autenticação
- Roles suportados: aluno, professor, coordenador, admin
- Middleware executa no servidor (Next.js)
- Verificações client-side complementam a segurança
- Notificações usam componente centralizado para consistência
