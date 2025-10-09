# Guia de Integração do Sistema RBAC

## Visão Geral
Este documento explica como o sistema de autorização baseado em roles (RBAC - Role-Based Access Control) foi implementado e como integrá-lo com o frontend.

---

## 1. Configurações das Roles

### ✅ Roles Suportadas
O sistema suporta 4 roles (perfis) de usuário:
- `aluno` - Acesso limitado a recursos próprios
- `professor` - Acesso completo a recursos
- `coordenador` - Acesso completo a recursos
- `admin` - Acesso completo a recursos

### ⚠️ Importante: Case-Sensitivity
As roles são **case-sensitive** e devem estar em **lowercase** (minúsculas).

**Solução implementada:**
```typescript
// No authController.ts, linha 45
nomePerfil = perfilRows[0].nome.toLowerCase();
```

Isso garante que independente de como o nome do perfil está no banco de dados (ex: "Aluno", "ALUNO", "aluno"), o token JWT sempre terá o role em lowercase.

### Verificar Nomes no Banco de Dados
Execute no seu banco de dados:
```sql
SELECT id, nome FROM perfil;
```

Se os nomes não corresponderem exatamente a `aluno`, `professor`, `coordenador` ou `admin` (case-insensitive), você precisa:
1. **Opção 1:** Atualizar o banco de dados
2. **Opção 2:** Modificar o arquivo `src/middleware/authorize.ts` para aceitar os nomes corretos

---

## 2. Matriz de Permissões

| Role | Paciente | Horário | User | Consulta |
|------|----------|---------|------|----------|
| **aluno** | read:own | read:own | read:own | - |
| **professor** | Todas* | Todas* | Todas* | Todas* |
| **coordenador** | Todas* | Todas* | Todas* | Todas* |
| **admin** | Todas* | Todas* | Todas* | Todas* |

\* Todas = `read:any`, `update:any`, `delete:any`

---

## 3. Rotas Protegidas

### Todas as rotas agora exigem autenticação e autorização:

#### `/paciente`
```typescript
GET    /paciente     - Requer: autenticação + "paciente:read:any"
GET    /paciente/:id - Requer: autenticação + "paciente:read:any"
POST   /paciente     - Requer: autenticação + "paciente:update:any"
PUT    /paciente/:id - Requer: autenticação + "paciente:update:any"
```

#### `/user` (usuario)
```typescript
GET    /usuario              - Requer: autenticação + "user:read:any"
GET    /usuario/fisioterapeutas - Requer: autenticação + "user:read:any"
GET    /usuario/:id          - Requer: autenticação + "user:read:any"
POST   /usuario              - Requer: autenticação + "user:update:any"
PUT    /usuario/:id          - Requer: autenticação + "user:update:any"
```

#### `/horario`
```typescript
GET    /horario     - Requer: autenticação + "horario:read:any"
GET    /horario/:id - Requer: autenticação + "horario:read:any"
POST   /horario     - Requer: autenticação + "horario:update:any"
PUT    /horario/:id - Requer: autenticação + "horario:update:any"
```

#### `/consulta`
```typescript
GET    /consulta     - Requer: autenticação + "paciente:read:any"
GET    /consulta/:id - Requer: autenticação + "paciente:read:any"
POST   /consulta     - Requer: autenticação + "paciente:update:any"
PUT    /consulta/:id - Requer: autenticação + "paciente:update:any"
DELETE /consulta/:id - Requer: autenticação + "paciente:delete:any"
```

#### Rotas Públicas (sem autenticação)
```typescript
POST /auth/login    - Login (não requer autenticação)
POST /register      - Registro (não requer autenticação)
GET  /              - Health check (não requer autenticação)
GET  /perfil        - Não protegida ainda
```

---

## 4. Impacto no Frontend

### 🚨 Breaking Changes

#### 4.1. Token JWT Atualizado
**Antes:**
```json
{
  "id": 1,
  "email": "usuario@exemplo.com",
  "perfil_id": 2
}
```

**Agora:**
```json
{
  "id": 1,
  "email": "usuario@exemplo.com",
  "role": "professor",
  "perfil_id": 2
}
```

**Nota:** Mantivemos `perfil_id` temporariamente para compatibilidade com frontend legado.

#### 4.2. Header de Autenticação Obrigatório
Todas as rotas protegidas agora exigem o header:
```
Authorization: Bearer <token>
```

#### 4.3. Novos Códigos de Status HTTP
- **401 Unauthorized**: Token ausente, inválido ou expirado
- **403 Forbidden**: Token válido mas sem permissão para a ação

---

## 5. Integração com Frontend

### 5.1. Atualizar Serviço de HTTP

```typescript
// Exemplo em Angular/TypeScript
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('token');
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(req);
  }
}
```

### 5.2. Tratamento de Erros

```typescript
// Exemplo de tratamento de erros
service.getData().subscribe({
  next: (data) => {
    // Sucesso
  },
  error: (error) => {
    if (error.status === 401) {
      // Token inválido ou expirado - redirecionar para login
      router.navigate(['/login']);
      localStorage.removeItem('token');
    } else if (error.status === 403) {
      // Sem permissão - mostrar mensagem
      showAlert('Você não tem permissão para realizar esta ação');
    }
  }
});
```

### 5.3. Armazenar Token Após Login

```typescript
// No serviço de login
login(email: string, senha: string) {
  return this.http.post('/auth/login', { email, senha })
    .subscribe((response: any) => {
      if (response.status === 'success') {
        // Armazenar token
        localStorage.setItem('token', response.token);
        
        // Opcional: armazenar informações do usuário
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Redirecionar para dashboard
        router.navigate(['/dashboard']);
      }
    });
}
```

### 5.4. Verificar Permissões no Frontend

```typescript
// Decodificar token para obter role
import jwt_decode from 'jwt-decode';

interface TokenPayload {
  id: number;
  email: string;
  role: string;
  perfil_id: number;
  iat: number;
  exp: number;
}

function getUserRole(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const decoded = jwt_decode<TokenPayload>(token);
    return decoded.role;
  } catch (error) {
    return null;
  }
}

// Exemplo de uso no template
function canCreatePatient(): boolean {
  const role = getUserRole();
  return ['professor', 'coordenador', 'admin'].includes(role || '');
}
```

---

## 6. Testes Recomendados

### 6.1. Testes de API (Backend)
```bash
# Login como aluno
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@teste.com","senha":"senha123"}'

# Usar token recebido
TOKEN="<token_recebido>"

# Testar acesso autorizado (deve funcionar)
curl http://localhost:3000/paciente \
  -H "Authorization: Bearer $TOKEN"

# Testar acesso não autorizado (deve retornar 403)
curl -X POST http://localhost:3000/paciente \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste"}'
```

### 6.2. Checklist de Testes
- [ ] Login com cada tipo de role (aluno, professor, coordenador, admin)
- [ ] Verificar que token inclui campo `role` em lowercase
- [ ] Verificar que token inclui campo `perfil_id` para compatibilidade
- [ ] Testar rotas GET com cada role
- [ ] Testar rotas POST/PUT/DELETE com aluno (deve falhar com 403)
- [ ] Testar rotas POST/PUT/DELETE com professor (deve funcionar)
- [ ] Testar requisição sem token (deve retornar 401)
- [ ] Testar requisição com token inválido (deve retornar 401)
- [ ] Testar requisição com token expirado (deve retornar 401)

---

## 7. Troubleshooting

### Problema: "Acesso negado" mesmo com permissão
**Causa:** Case mismatch entre role no token e roles no authorize.ts
**Solução:** Verificar que authController.ts está usando `.toLowerCase()` na linha 45

### Problema: Token não é aceito
**Causa:** JWT_SECRET diferente entre ambientes
**Solução:** Garantir que .env tem a mesma JWT_SECRET em dev e prod

### Problema: 401 mesmo com token válido
**Causa:** Token expirado (1 hora de validade)
**Solução:** Frontend deve implementar refresh token ou pedir novo login

### Problema: Frontend não recebe role
**Causa:** Banco de dados não tem perfil configurado para o usuário
**Solução:** Verificar que todos os usuários têm perfil_id válido

---

## 8. Próximos Passos

### Melhorias Recomendadas
1. **Implementar `read:own` vs `read:any`**
   - Atualmente todas as rotas usam `:any`
   - Implementar lógica no controller para filtrar por usuário quando `:own`

2. **Adicionar resource `consulta`**
   - Atualmente consultas usam resource `paciente`
   - Criar resource específico para melhor granularidade

3. **Proteger rota `/perfil`**
   - Atualmente não tem autenticação
   - Apenas admin/coordenador devem poder gerenciar perfis

4. **Implementar refresh token**
   - Token atual expira em 1 hora
   - Implementar mecanismo de renovação sem novo login

5. **Logs de auditoria**
   - Registrar tentativas de acesso não autorizado
   - Monitorar uso de permissões

---

## 9. Suporte

### Em caso de dúvidas:
1. Verifique este documento primeiro
2. Consulte a documentação do Express e JWT
3. Entre em contato com o time de desenvolvimento

### Links Úteis
- [Express.js Documentation](https://expressjs.com/)
- [JSON Web Tokens](https://jwt.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Última atualização:** 2025-06-20  
**Versão:** 1.0.0  
**Autor:** Sistema de Desenvolvimento API Fisioterapia
