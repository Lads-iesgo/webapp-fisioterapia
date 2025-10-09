# Integração RBAC - Sistema de Fisioterapia

## Resumo das Modificações Implementadas

Este documento descreve as modificações implementadas no frontend do sistema de Fisioterapia para integração com o sistema RBAC (Role-Based Access Control) do backend.

---

## 📋 Arquivos Criados

### 1. `src/app/utils/auth.ts`

Utilitário completo para gerenciamento de autenticação e permissões:

**Funções principais:**

- `getTokenPayload()` - Decodifica o token JWT e retorna o payload
- `getUserRole()` - Obtém o role do usuário atual
- `getUserInfo()` - Obtém informações completas do usuário
- `isTokenExpired()` - Verifica se o token está expirado
- `isAuthenticated()` - Verifica se o usuário está autenticado
- `logout()` - Remove o token e limpa dados do usuário
- `hasPermission()` - Verifica se o usuário tem permissão para uma ação específica
- `canUpdate()`, `canDelete()`, `canRead()` - Funções auxiliares para verificar permissões

### 2. `src/app/hooks/usePermissions.ts`

Hook customizado do React para verificação de permissões em componentes:

**Funções expostas:**

- `userRole` - Role do usuário atual
- `isLoading` - Estado de carregamento
- `checkPermission()` - Verifica permissões customizadas
- `checkCanUpdate()`, `checkCanDelete()`, `checkCanRead()` - Verificações específicas
- `isAluno()`, `isProfessor()`, `isCoordenador()`, `isAdmin()` - Verificações de role
- `hasFullAccess()` - Verifica se tem acesso completo (professor/coordenador/admin)
- `getUser()` - Obtém informações do usuário

---

## 🔄 Arquivos Modificados

### 1. `src/app/interfaces/types.ts`

**Adicionado:**

- Interface `TokenPayload` - Estrutura do payload do JWT
- Interface `UserInfo` - Informações do usuário
- Interface `LoginResponse` - Resposta da API de login
- Type `UserRole` - Tipos de roles suportados
- Types `Permission` e `PermissionScope` - Tipos de permissões

### 2. `src/app/services/api.ts`

**Melhorado:**

- Interceptor de resposta agora trata erro 403 (Forbidden)
- Limpa localStorage ao receber erro 401
- Armazena flags no sessionStorage para exibir mensagens apropriadas
- Mensagens de sessão expirada e permissão negada

### 3. `src/app/login/page.tsx`

**Modificações:**

- Importado `useEffect` para verificar mensagens de sessão
- Armazena `role` e outros campos do usuário no localStorage
- Exibe notificações de sessão expirada e permissão negada
- Trata novos campos do token JWT retornado pela API

### 4. `src/middleware.ts`

**Implementado sistema completo de autorização:**

- Decodifica e valida token JWT
- Verifica expiração do token
- Implementa matriz de permissões por rota
- Define permissões específicas:
  - `/cadastroPaciente` - professor, coordenador, admin
  - `/cadastroUsuario` - professor, coordenador, admin
  - `/cadastroConsulta` - professor, coordenador, admin
  - `/disponibilidade` - todos os roles autenticados
  - `/home` - todos os roles autenticados
- Redireciona para `/home` se não tiver permissão (ao invés de `/login`)

### 5. `src/app/cadastroPaciente/page.tsx`

**Adicionado:**

- Hook `usePermissions` para verificar permissões
- Estado `canCreate` para controlar acesso
- Mensagem de aviso quando usuário não tem permissão
- Botão "Salvar" desabilitado para usuários sem permissão (alunos)

### 6. `src/app/cadastroUsuario/page.tsx`

**Adicionado:**

- Hook `usePermissions` para verificar permissões
- Estado `canCreate` para controlar acesso
- Mensagem de aviso quando usuário não tem permissão
- Botão "Salvar" desabilitado para usuários sem permissão (alunos)

### 7. `src/app/cadastroConsulta/page.tsx`

**Adicionado:**

- Hook `usePermissions` para verificar permissões
- Estado `canCreate` para controlar acesso
- Mensagem de aviso quando usuário não tem permissão
- Botão "Salvar" desabilitado para usuários sem permissão (alunos)

### 8. `src/app/home/page.tsx`

**Modificado:**

- Importado `getUserInfo` de `utils/auth`
- Usa role do token JWT decodificado
- Mantém compatibilidade com localStorage para obter nome do usuário
- Estado `roleUsuario` para armazenar role atual

---

## 🎯 Matriz de Permissões Implementada

| Role            | Paciente   | Horário    | Usuário    | Consulta | Home | Disponibilidade |
| --------------- | ---------- | ---------- | ---------- | -------- | ---- | --------------- |
| **aluno**       | read:own\* | read:own\* | read:own\* | -        | ✅   | ✅              |
| **professor**   | ✅ Todas   | ✅ Todas   | ✅ Todas   | ✅ Todas | ✅   | ✅              |
| **coordenador** | ✅ Todas   | ✅ Todas   | ✅ Todas   | ✅ Todas | ✅   | ✅              |
| **admin**       | ✅ Todas   | ✅ Todas   | ✅ Todas   | ✅ Todas | ✅   | ✅              |

\* _Nota: A implementação atual bloqueia ações de CREATE/UPDATE/DELETE para alunos. A funcionalidade `read:own` ainda precisa ser implementada no backend para filtrar dados por usuário._

---

## 🔐 Fluxo de Autenticação e Autorização

### 1. Login

```
Usuario → /login → API Backend
         ↓
    Token JWT (com role)
         ↓
    Cookie + localStorage
```

### 2. Requisições

```
Usuário → Requisição
    ↓
api.ts (interceptor)
    ↓
Header: Authorization Bearer {token}
    ↓
Backend API
    ↓
201/200 (sucesso) OU 401/403 (erro)
```

### 3. Navegação

```
Usuário → Acessar Rota
    ↓
middleware.ts
    ↓
Validar Token
    ↓
Verificar Role vs Permissões da Rota
    ↓
Permitir OU Redirecionar
```

### 4. Componentes

```
Componente → usePermissions()
    ↓
Decodificar Token
    ↓
Verificar Role
    ↓
Habilitar/Desabilitar UI
```

---

## 📦 Dependências Adicionadas

```json
{
	"jwt-decode": "^4.0.0"
}
```

**Instalação:**

```bash
npm install jwt-decode
```

---

## 🧪 Como Testar

### 1. Login como diferentes roles

**Aluno:**

- ✅ Pode acessar `/home` e `/disponibilidade`
- ❌ NÃO pode cadastrar pacientes, usuários ou consultas
- ✅ Vê mensagem de permissão negada nas páginas de cadastro
- ✅ Botões de "Salvar" ficam desabilitados

**Professor/Coordenador/Admin:**

- ✅ Pode acessar todas as rotas
- ✅ Pode cadastrar pacientes, usuários e consultas
- ✅ Todos os botões funcionam normalmente

### 2. Testar Expiração de Token

1. Faça login
2. Aguarde 1 hora (ou modifique o token manualmente)
3. Tente fazer uma requisição
4. ✅ Deve redirecionar para `/login` com mensagem de sessão expirada

### 3. Testar Acesso Direto às Rotas

1. Como aluno, tente acessar diretamente: `/cadastroPaciente`
2. ✅ Middleware deve redirecionar para `/home`
3. ❌ Não deve conseguir acessar a página de cadastro

---

## 🚀 Melhorias Futuras Recomendadas

### 1. Implementar `read:own` vs `read:any`

Atualmente todas as listagens mostram todos os dados. Implementar filtros para:

- Alunos verem apenas seus próprios dados
- Professores/coordenadores/admin verem todos os dados

### 2. Refresh Token

Implementar mecanismo de renovação automática do token antes de expirar.

### 3. Logs de Auditoria (Frontend)

Registrar tentativas de acesso não autorizado no console ou enviar para analytics.

### 4. Componentizar Verificações

Criar componentes como:

- `<ProtectedButton>` - Botão que só aparece se tiver permissão
- `<ProtectedRoute>` - Wrapper para rotas protegidas
- `<RoleGuard>` - Mostrar/esconder conteúdo baseado em role

### 5. Toast/Notifications Globais

Implementar sistema de notificações global para mensagens de erro 403.

---

## 📚 Referências

- [Guia de Integração RBAC](./RBAC_INTEGRATION_GUIDE.md) - Documentação completa do backend
- [JWT.io](https://jwt.io/) - Ferramenta para decodificar tokens
- [jwt-decode](https://www.npmjs.com/package/jwt-decode) - Biblioteca utilizada

---

## ✅ Checklist de Implementação

- [x] Instalar jwt-decode
- [x] Criar utils/auth.ts
- [x] Criar hook usePermissions
- [x] Atualizar interfaces types.ts
- [x] Melhorar interceptor da API
- [x] Atualizar página de login
- [x] Atualizar middleware com verificação de roles
- [x] Adicionar verificação de permissões em cadastroPaciente
- [x] Adicionar verificação de permissões em cadastroUsuario
- [x] Adicionar verificação de permissões em cadastroConsulta
- [x] Atualizar página Home para usar role do token
- [x] Documentar mudanças

---

## 🐛 Troubleshooting

### Problema: Botão continua habilitado para aluno

**Solução:** Verificar se o role no token está em lowercase. O backend deve retornar `"aluno"` e não `"Aluno"`.

### Problema: Redirecionamento infinito

**Solução:** Verificar se o token está válido e se o middleware não está conflitando com rotas públicas.

### Problema: Erro ao decodificar token

**Solução:** Verificar se o JWT_SECRET é o mesmo no frontend e backend.

### Problema: 403 mesmo com permissão

**Solução:** Verificar se o role no token corresponde exatamente aos roles esperados no middleware.

---

**Data de Implementação:** 08/10/2025  
**Versão:** 1.0.0  
**Implementado por:** GitHub Copilot
