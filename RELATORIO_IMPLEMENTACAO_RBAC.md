# Relatório de Implementação RBAC - Sistema de Fisioterapia

**Data:** 08/10/2025  
**Versão:** 1.0.0  
**Repositório:** webapp-fisioterapia  
**Branch:** develop

---

## 📋 Sumário Executivo

Este documento descreve todas as alterações implementadas no frontend da aplicação web de Fisioterapia para integração completa com o sistema RBAC (Role-Based Access Control) do backend.

### Objetivo

Implementar controle de acesso baseado em roles (perfis de usuário) para garantir que:

- **Alunos** tenham acesso apenas de leitura
- **Professores, Coordenadores e Administradores** tenham acesso completo

---

## 🔧 Alterações Técnicas

### 1. Dependências Adicionadas

```json
{
	"jwt-decode": "^4.0.0"
}
```

**Instalação realizada:**

```bash
npm install jwt-decode
```

---

## 📁 Arquivos Criados

### 1.1. `src/app/utils/auth.ts`

**Descrição:** Utilitário completo para gerenciamento de autenticação e permissões.

**Principais Funções:**

| Função                                   | Descrição                            | Retorno                |
| ---------------------------------------- | ------------------------------------ | ---------------------- |
| `getTokenPayload()`                      | Decodifica o token JWT               | `TokenPayload \| null` |
| `getUserRole()`                          | Obtém o role do usuário              | `string \| null`       |
| `getUserInfo()`                          | Obtém informações do usuário         | `UserInfo \| null`     |
| `isTokenExpired()`                       | Verifica se token está expirado      | `boolean`              |
| `isAuthenticated()`                      | Verifica se usuário está autenticado | `boolean`              |
| `logout()`                               | Remove token e limpa dados           | `void`                 |
| `hasPermission(resource, action, scope)` | Verifica permissão específica        | `boolean`              |
| `canUpdate(resource)`                    | Verifica se pode criar/atualizar     | `boolean`              |
| `canDelete(resource)`                    | Verifica se pode deletar             | `boolean`              |
| `canRead(resource)`                      | Verifica se pode ler                 | `boolean`              |

**Código de exemplo:**

```typescript
import { getUserRole, hasPermission, canUpdate } from "../utils/auth";

// Obter role do usuário
const role = getUserRole(); // 'aluno', 'professor', 'coordenador', 'admin'

// Verificar permissão
if (canUpdate("paciente")) {
	// Usuário pode cadastrar/editar pacientes
}
```

---

### 1.2. `src/app/hooks/usePermissions.ts`

**Descrição:** Hook React customizado para verificação de permissões em componentes.

**Propriedades retornadas:**

| Propriedade         | Tipo               | Descrição                         |
| ------------------- | ------------------ | --------------------------------- |
| `userRole`          | `UserRole \| null` | Role do usuário atual             |
| `isLoading`         | `boolean`          | Estado de carregamento            |
| `checkPermission()` | `function`         | Verifica permissão customizada    |
| `checkCanUpdate()`  | `function`         | Verifica permissão de atualização |
| `checkCanDelete()`  | `function`         | Verifica permissão de exclusão    |
| `checkCanRead()`    | `function`         | Verifica permissão de leitura     |
| `isAluno()`         | `function`         | Verifica se é aluno               |
| `isProfessor()`     | `function`         | Verifica se é professor           |
| `isCoordenador()`   | `function`         | Verifica se é coordenador         |
| `isAdmin()`         | `function`         | Verifica se é admin               |
| `hasFullAccess()`   | `function`         | Verifica acesso completo          |
| `getUser()`         | `function`         | Obtém dados do usuário            |

**Código de exemplo:**

```typescript
import { usePermissions } from "../hooks/usePermissions";

function MeuComponente() {
	const { checkCanUpdate, isAluno } = usePermissions();

	const canEdit = checkCanUpdate("paciente");

	return <button disabled={!canEdit}>Editar</button>;
}
```

---

### 1.3. `RBAC_FRONTEND_CHANGES.md`

**Descrição:** Documentação completa e detalhada de todas as mudanças implementadas.

**Conteúdo:**

- Resumo das modificações
- Arquivos criados e modificados
- Matriz de permissões
- Fluxo de autenticação e autorização
- Instruções de teste
- Melhorias futuras recomendadas
- Troubleshooting

---

### 1.4. `RBAC_USAGE_EXAMPLES.md`

**Descrição:** Guia prático com 9 exemplos de uso do sistema de permissões.

**Exemplos incluídos:**

1. Verificar permissões em um componente
2. Usar funções de auth diretamente
3. Criar componente de botão protegido
4. Criar guard de rota customizado
5. Exibir conteúdo condicional
6. Tratamento de erros de permissão
7. Logout seguro
8. Hook customizado para acesso a rota
9. Lista com ações condicionais

---

## 📝 Arquivos Modificados

### 2.1. `src/app/interfaces/types.ts`

**Alterações:** Adicionadas novas interfaces e tipos para suportar RBAC.

**Interfaces adicionadas:**

```typescript
// Payload do token JWT
export interface TokenPayload {
	id: number;
	email: string;
	role: string;
	perfil_id: number;
	iat: number;
	exp: number;
}

// Informações do usuário
export interface UserInfo {
	id: number;
	email: string;
	role: string;
	perfil_id: number;
	nome?: string;
	perfil?: string;
}

// Resposta do login
export interface LoginResponse {
	status: string;
	token: string;
	user: {
		id: number;
		email: string;
		nome: string;
		perfil: string;
		role?: string;
		perfil_id: number;
	};
}

// Tipos de roles
export type UserRole = "aluno" | "professor" | "coordenador" | "admin";

// Tipos de permissões
export type Permission = "read" | "update" | "delete";
export type PermissionScope = "any" | "own";
```

---

### 2.2. `src/app/services/api.ts`

**Alterações:** Melhorado interceptor de resposta para tratar erros 401 e 403.

**Antes:**

```typescript
if (error?.response?.status === 401 && !skiptRedirect) {
	document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	if (typeof window !== "undefined" && window.location.pathname !== "/login") {
		window.location.href = "/login";
	}
}
```

**Depois:**

```typescript
// Tratamento de erro 401 (Não autenticado)
if (error?.response?.status === 401 && !skiptRedirect) {
	document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	localStorage.removeItem("userData");

	if (typeof window !== "undefined" && window.location.pathname !== "/login") {
		sessionStorage.setItem("sessionExpired", "true");
		window.location.href = "/login";
	}
}

// Tratamento de erro 403 (Sem permissão)
if (error?.response?.status === 403) {
	console.error(
		"Acesso negado: Você não tem permissão para realizar esta ação",
	);
	if (typeof window !== "undefined") {
		sessionStorage.setItem("permissionDenied", "true");
	}
}
```

**Melhorias:**

- ✅ Limpa localStorage ao receber 401
- ✅ Armazena flags no sessionStorage para mensagens
- ✅ Trata erro 403 (Forbidden) separadamente

---

### 2.3. `src/app/login/page.tsx`

**Alterações:** Atualizado para armazenar role do usuário e exibir mensagens apropriadas.

**Adicionado import:**

```typescript
import { useState, useEffect } from "react";
```

**Adicionado useEffect para mensagens:**

```typescript
useEffect(() => {
	const sessionExpired = sessionStorage.getItem("sessionExpired");
	const permissionDenied = sessionStorage.getItem("permissionDenied");

	if (sessionExpired === "true") {
		showNotification(
			"error",
			"Sua sessão expirou. Por favor, faça login novamente.",
		);
		sessionStorage.removeItem("sessionExpired");
	}

	if (permissionDenied === "true") {
		showNotification(
			"error",
			"Você não tem permissão para acessar este recurso.",
		);
		sessionStorage.removeItem("permissionDenied");
	}
}, [showNotification]);
```

**Modificado armazenamento do usuário:**

```typescript
// Antes
localStorage.setItem(
	"userData",
	JSON.stringify({
		email: response.data.user.email,
		nome: response.data.user.nome,
		perfil: response.data.user.perfil,
	}),
);

// Depois
localStorage.setItem(
	"userData",
	JSON.stringify({
		id: response.data.user.id,
		email: response.data.user.email,
		nome: response.data.user.nome,
		perfil: response.data.user.perfil,
		role: response.data.user.role || response.data.user.perfil?.toLowerCase(),
		perfil_id: response.data.user.perfil_id,
	}),
);
```

**Melhorias:**

- ✅ Armazena role do usuário no localStorage
- ✅ Exibe notificação de sessão expirada
- ✅ Exibe notificação de permissão negada
- ✅ Compatibilidade com API que retorna role

---

### 2.4. `src/middleware.ts`

**Alterações:** Implementado sistema completo de autorização baseado em roles.

**Principais mudanças:**

1. **Importação do jwt-decode:**

```typescript
import { jwtDecode } from "jwt-decode";
```

2. **Interface do payload:**

```typescript
interface TokenPayload {
	id: number;
	email: string;
	role: string;
	perfil_id: number;
	iat: number;
	exp: number;
}
```

3. **Mapeamento de permissões por rota:**

```typescript
const routePermissions: Record<string, string[]> = {
	"/cadastroPaciente": ["professor", "coordenador", "admin"],
	"/cadastroUsuario": ["professor", "coordenador", "admin"],
	"/cadastroConsulta": ["professor", "coordenador", "admin"],
	"/disponibilidade": ["aluno", "professor", "coordenador", "admin"],
	"/home": ["aluno", "professor", "coordenador", "admin"],
};
```

4. **Função de validação do token:**

```typescript
function validateToken(token: string): TokenPayload | null {
	try {
		const decoded = jwtDecode<TokenPayload>(token);
		const currentTime = Math.floor(Date.now() / 1000);
		if (decoded.exp < currentTime) {
			return null;
		}
		return decoded;
	} catch (error) {
		console.error("Erro ao decodificar token:", error);
		return null;
	}
}
```

5. **Função de verificação de permissão:**

```typescript
function hasRoutePermission(pathname: string, role: string): boolean {
	const routeKey = Object.keys(routePermissions).find((route) =>
		pathname.startsWith(route),
	);

	if (!routeKey) {
		return true;
	}

	const allowedRoles = routePermissions[routeKey];
	return allowedRoles.includes(role);
}
```

6. **Lógica do middleware atualizada:**

- Valida token JWT
- Verifica expiração
- Verifica permissões de acesso à rota
- Redireciona para `/home` se não tiver permissão
- Limpa cookie de token inválido

**Melhorias:**

- ✅ Validação de token JWT no middleware
- ✅ Verificação de expiração
- ✅ Controle de acesso por rota baseado em role
- ✅ Remoção de tokens inválidos

---

### 2.5. `src/app/cadastroPaciente/page.tsx`

**Alterações:** Adicionada verificação de permissões para cadastro de pacientes.

**Adicionado import:**

```typescript
import { useState, useEffect } from "react";
import { usePermissions } from "../hooks/usePermissions";
```

**Adicionado hook e estado:**

```typescript
const { checkCanUpdate } = usePermissions();
const [canCreate, setCanCreate] = useState(false);

useEffect(() => {
	setCanCreate(checkCanUpdate("paciente"));
}, [checkCanUpdate]);
```

**Adicionada mensagem de permissão:**

```typescript
{
	!canCreate && (
		<div className='p-4 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-300'>
			Você não tem permissão para cadastrar pacientes. Apenas professores,
			coordenadores e administradores podem realizar esta ação.
		</div>
	);
}
```

**Botão atualizado:**

```typescript
<Button
	text={loading ? "Salvando..." : "Salvar"}
	onClick={() => {}}
	variant='primary'
	type='submit'
	disabled={!canCreate || loading} // Adicionado !canCreate
/>
```

**Melhorias:**

- ✅ Verifica permissões ao carregar a página
- ✅ Exibe mensagem quando não tem permissão
- ✅ Desabilita botão de salvar para usuários sem permissão

---

### 2.6. `src/app/cadastroUsuario/page.tsx`

**Alterações:** Adicionada verificação de permissões para cadastro de usuários.

**Adicionado import:**

```typescript
import { usePermissions } from "../hooks/usePermissions";
```

**Adicionado hook e estado:**

```typescript
const { checkCanUpdate } = usePermissions();
const [canCreate, setCanCreate] = useState(false);

useEffect(() => {
	setCanCreate(checkCanUpdate("user"));
}, [checkCanUpdate]);
```

**Adicionada mensagem de permissão:**

```typescript
{
	!canCreate && (
		<div className='p-4 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-300 mt-4'>
			Você não tem permissão para cadastrar usuários. Apenas professores,
			coordenadores e administradores podem realizar esta ação.
		</div>
	);
}
```

**Botão atualizado:**

```typescript
<Button
	text={loading ? "Salvando..." : "Salvar"}
	onClick={() => {}}
	variant='primary'
	type='submit'
	disabled={!canCreate || loadingPerfis || loading} // Adicionado !canCreate
/>
```

**Melhorias:**

- ✅ Verifica permissões ao carregar a página
- ✅ Exibe mensagem quando não tem permissão
- ✅ Desabilita botão de salvar para usuários sem permissão

---

### 2.7. `src/app/cadastroConsulta/page.tsx`

**Alterações:** Adicionada verificação de permissões para cadastro de consultas.

**Adicionado import:**

```typescript
import { usePermissions } from "../hooks/usePermissions";
```

**Adicionado hook e estado:**

```typescript
const { checkCanUpdate } = usePermissions();
const [canCreate, setCanCreate] = useState(false);

useEffect(() => {
	setCanCreate(checkCanUpdate("paciente"));
}, [checkCanUpdate]);
```

**Adicionada mensagem de permissão:**

```typescript
{
	!canCreate && (
		<div className='p-4 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-300 mt-4'>
			Você não tem permissão para cadastrar consultas. Apenas professores,
			coordenadores e administradores podem realizar esta ação.
		</div>
	);
}
```

**Botão atualizado:**

```typescript
<Button
	text={loading ? "Salvando..." : "Salvar"}
	onClick={() => {}}
	variant='primary'
	type='submit'
	disabled={!canCreate || loading} // Adicionado !canCreate
/>
```

**Melhorias:**

- ✅ Verifica permissões ao carregar a página
- ✅ Exibe mensagem quando não tem permissão
- ✅ Desabilita botão de salvar para usuários sem permissão

---

### 2.8. `src/app/home/page.tsx`

**Alterações:** Atualizado para usar role do token JWT.

**Adicionado import:**

```typescript
import { getUserInfo } from "../utils/auth";
```

**Modificado useEffect:**

```typescript
useEffect(() => {
	const loginSuccess = sessionStorage.getItem("loginSuccess");

	if (loginSuccess === "true") {
		// Obter informações do usuário do token JWT
		const userInfo = getUserInfo();
		let perfilUsuario = "";

		if (userInfo) {
			// Tentar buscar dados do usuário no localStorage para obter o nome
			const userDataString = localStorage.getItem("userData");
			if (userDataString) {
				try {
					const userData = JSON.parse(userDataString);
					setNomeUsuario(userData.nome || "");
					perfilUsuario = userData.perfil || userInfo.role;
				} catch (e) {
					console.error("Erro ao analisar dados do usuário:", e);
					perfilUsuario = userInfo.role;
				}
			} else {
				perfilUsuario = userInfo.role;
			}
		}

		// Mostrar notificação
		const mensagemBoasVindas = perfilUsuario
			? `Login realizado com sucesso! Bem-vindo ${perfilUsuario}!`
			: "Login realizado com sucesso! Bem-vindo(a)!";

		showNotification("success", mensagemBoasVindas);
		sessionStorage.removeItem("loginSuccess");
	}

	// Sempre atualizar informações do usuário
	const userInfo = getUserInfo();
	if (userInfo) {
		const userDataString = localStorage.getItem("userData");
		if (userDataString) {
			try {
				const userData = JSON.parse(userDataString);
				setNomeUsuario(userData.nome || "");
			} catch (e) {
				console.error("Erro ao analisar dados do usuário:", e);
			}
		}
	}
}, [showNotification]);
```

**Melhorias:**

- ✅ Usa role do token JWT decodificado
- ✅ Mantém compatibilidade com localStorage para nome
- ✅ Fallback para role caso perfil não esteja disponível

---

## 🔐 Matriz de Permissões Implementada

| Role            | Paciente            | Horário             | Usuário             | Consulta         | Home      | Disponibilidade |
| --------------- | ------------------- | ------------------- | ------------------- | ---------------- | --------- | --------------- |
| **aluno**       | ❌ Apenas Leitura\* | ❌ Apenas Leitura\* | ❌ Apenas Leitura\* | ❌ Bloqueado     | ✅ Acesso | ✅ Acesso       |
| **professor**   | ✅ CRUD Completo    | ✅ CRUD Completo    | ✅ CRUD Completo    | ✅ CRUD Completo | ✅ Acesso | ✅ Acesso       |
| **coordenador** | ✅ CRUD Completo    | ✅ CRUD Completo    | ✅ CRUD Completo    | ✅ CRUD Completo | ✅ Acesso | ✅ Acesso       |
| **admin**       | ✅ CRUD Completo    | ✅ CRUD Completo    | ✅ CRUD Completo    | ✅ CRUD Completo | ✅ Acesso | ✅ Acesso       |

\* _Nota: A funcionalidade de "apenas leitura própria" (`read:own`) precisa ser implementada no backend para filtrar dados por usuário. Atualmente, alunos têm acesso bloqueado para CREATE/UPDATE/DELETE._

---

## 🎯 Fluxo de Autenticação e Autorização

### Fluxo Completo

```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  1. Login (POST /auth/login)        │
│     - Email e senha                 │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  2. Backend API                     │
│     - Valida credenciais            │
│     - Gera token JWT com role       │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  3. Frontend recebe resposta        │
│     - Token JWT                     │
│     - Dados do usuário (com role)   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  4. Armazenamento                   │
│     - Cookie: token JWT             │
│     - localStorage: userData        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  5. Navegação                       │
│     - Middleware valida token       │
│     - Verifica role vs rota         │
│     - Permite ou redireciona        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  6. Página carregada                │
│     - usePermissions() verifica     │
│     - UI adaptada ao role           │
│     - Botões habilitados/desabilitados│
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  7. Requisições API                 │
│     - Interceptor adiciona token    │
│     - Backend valida permissões     │
│     - Retorna 200/201 ou 401/403    │
└─────────────────────────────────────┘
```

---

## ✅ Validações de Build

**Comando executado:**

```bash
npm run build
```

**Resultado:**

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (12/12)
✓ Collecting build traces
✓ Finalizing page optimization
```

**Status:**

- ✅ Zero erros de TypeScript
- ✅ Zero erros de ESLint
- ✅ Build de produção criado com sucesso
- ✅ Todas as páginas geradas corretamente

---

## 📊 Estatísticas do Projeto

### Tamanho dos Bundles

```
Route                          Size      First Load JS
├ /                           173 B     135 kB
├ /cadastroConsulta          5.07 kB    137 kB
├ /cadastroPaciente          5.54 kB    138 kB
├ /cadastroUsuario           5.92 kB    138 kB
├ /disponibilidade          25.7 kB     236 kB
├ /home                      2.53 kB    216 kB
├ /login                      174 B     135 kB
└ /recuperar-senha           2.38 kB    132 kB

Middleware                    34 kB
```

---

## 🧪 Testes Recomendados

### Cenários de Teste

#### 1. Login como Aluno

- [ ] Fazer login com credenciais de aluno
- [ ] Verificar acesso à página `/home` (deve funcionar)
- [ ] Verificar acesso à página `/disponibilidade` (deve funcionar)
- [ ] Tentar acessar `/cadastroPaciente` (deve redirecionar para `/home`)
- [ ] Tentar acessar `/cadastroUsuario` (deve redirecionar para `/home`)
- [ ] Tentar acessar `/cadastroConsulta` (deve redirecionar para `/home`)

#### 2. Login como Professor

- [ ] Fazer login com credenciais de professor
- [ ] Verificar acesso a todas as páginas (deve funcionar)
- [ ] Verificar que todos os botões estão habilitados
- [ ] Tentar cadastrar um paciente (deve funcionar)
- [ ] Tentar cadastrar um usuário (deve funcionar)
- [ ] Tentar cadastrar uma consulta (deve funcionar)

#### 3. Expiração de Token

- [ ] Fazer login
- [ ] Aguardar expiração do token (1 hora) ou modificar manualmente
- [ ] Tentar fazer uma requisição
- [ ] Verificar redirecionamento para `/login`
- [ ] Verificar mensagem "Sua sessão expirou"

#### 4. Permissões Negadas

- [ ] Como aluno, tentar fazer requisição POST para cadastro
- [ ] Verificar erro 403 no console
- [ ] Verificar que botão está desabilitado
- [ ] Verificar mensagem de permissão negada na tela

#### 5. Token Inválido

- [ ] Modificar o token no cookie manualmente
- [ ] Tentar navegar para uma página protegida
- [ ] Verificar redirecionamento para `/login`
- [ ] Verificar que token foi removido dos cookies

---

## 🚀 Melhorias Futuras Recomendadas

### 1. Implementar `read:own` vs `read:any`

**Prioridade:** Alta  
**Descrição:** Permitir que alunos vejam apenas seus próprios dados ao invés de bloquear completamente o acesso.

**Exemplo:**

```typescript
// Aluno veria apenas suas próprias consultas
GET /consulta?usuario_id={id_do_aluno}
```

### 2. Refresh Token

**Prioridade:** Média  
**Descrição:** Implementar mecanismo de renovação automática do token antes de expirar.

**Fluxo proposto:**

```
Token expira em 1h
→ Aos 50min, frontend faz requisição para renovar
→ Backend retorna novo token
→ Frontend atualiza cookie
```

### 3. Componentes Reutilizáveis

**Prioridade:** Média  
**Descrição:** Criar componentes prontos para verificação de permissões.

**Exemplos:**

- `<ProtectedButton>` - Botão que só aparece se tiver permissão
- `<ProtectedRoute>` - Wrapper para rotas protegidas
- `<RoleGuard>` - Mostrar/esconder conteúdo baseado em role

### 4. Logs de Auditoria

**Prioridade:** Baixa  
**Descrição:** Registrar tentativas de acesso não autorizado.

**Implementação:**

```typescript
// Em utils/auth.ts
function logAccessDenied(resource: string, action: string) {
	console.warn(`Acesso negado: ${action} em ${resource}`);
	// Enviar para serviço de analytics
	analytics.track("access_denied", { resource, action });
}
```

### 5. Sistema de Notificações Global

**Prioridade:** Baixa  
**Descrição:** Implementar toast/notificações para mensagens de erro 403.

---

## 🐛 Troubleshooting

### Problema: Botão continua habilitado para aluno

**Causa:** Role no token não está em lowercase.  
**Solução:** Verificar que backend retorna `"aluno"` e não `"Aluno"`.

```typescript
// No authController.ts do backend
nomePerfil = perfilRows[0].nome.toLowerCase();
```

### Problema: Redirecionamento infinito

**Causa:** Token inválido ou middleware conflitante.  
**Solução:**

1. Limpar cookies e localStorage
2. Fazer login novamente
3. Verificar configuração do middleware

### Problema: Erro ao decodificar token

**Causa:** JWT_SECRET diferente entre ambientes.  
**Solução:** Garantir que `.env` tem o mesmo `JWT_SECRET` em dev e prod.

### Problema: 403 mesmo com permissão

**Causa:** Role no token não corresponde aos roles esperados.  
**Solução:**

1. Verificar token no [jwt.io](https://jwt.io)
2. Comparar role do token com `routePermissions` no middleware
3. Verificar case-sensitivity

### Problema: Token não persiste após refresh

**Causa:** Cookie não está sendo salvo corretamente.  
**Solução:** Verificar configurações do cookie:

```typescript
cookies.set("token", response.data.token, {
	expires: 1,
	secure: process.env.NODE_ENV === "production",
	sameSite: "strict",
});
```

---

## 📚 Referências

### Documentação

- [RBAC_INTEGRATION_GUIDE.md](./RBAC_INTEGRATION_GUIDE.md) - Guia completo do backend
- [RBAC_FRONTEND_CHANGES.md](./RBAC_FRONTEND_CHANGES.md) - Documentação técnica completa
- [RBAC_USAGE_EXAMPLES.md](./RBAC_USAGE_EXAMPLES.md) - Exemplos práticos de uso

### Bibliotecas

- [jwt-decode](https://www.npmjs.com/package/jwt-decode) - Biblioteca para decodificar JWT
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware) - Documentação oficial
- [TypeScript](https://www.typescriptlang.org/) - Documentação da linguagem

### Ferramentas

- [JWT.io](https://jwt.io/) - Ferramenta online para decodificar tokens
- [Can I Use](https://caniuse.com/) - Compatibilidade de navegadores

---

## 👥 Equipe

**Desenvolvido por:** GitHub Copilot  
**Revisado por:** [Inserir nome]  
**Aprovado por:** [Inserir nome]

---

## 📅 Histórico de Versões

| Versão | Data       | Descrição                                      |
| ------ | ---------- | ---------------------------------------------- |
| 1.0.0  | 08/10/2025 | Implementação inicial do sistema RBAC completo |

---

## ✅ Checklist de Implementação

- [x] Instalar dependência jwt-decode
- [x] Criar arquivo utils/auth.ts
- [x] Criar hook usePermissions
- [x] Atualizar interfaces types.ts
- [x] Melhorar interceptor da API
- [x] Atualizar página de login
- [x] Implementar middleware com validação de roles
- [x] Adicionar verificação de permissões em cadastroPaciente
- [x] Adicionar verificação de permissões em cadastroUsuario
- [x] Adicionar verificação de permissões em cadastroConsulta
- [x] Atualizar página Home
- [x] Criar documentação completa
- [x] Criar guia de exemplos
- [x] Validar build de produção
- [x] Criar relatório de implementação

---

## 📞 Suporte

Para dúvidas ou problemas relacionados à implementação RBAC:

1. Consulte primeiro a [documentação completa](./RBAC_FRONTEND_CHANGES.md)
2. Verifique os [exemplos de uso](./RBAC_USAGE_EXAMPLES.md)
3. Revise a seção de [Troubleshooting](#-troubleshooting)
4. Entre em contato com a equipe de desenvolvimento

---

**Fim do Relatório**

_Este documento foi gerado automaticamente em 08/10/2025 às 14:30_
