# Guia de Testes - Sistema de Controle de Acesso RBAC

## Objetivo

Este guia fornece cenários de teste para validar a implementação do controle de acesso baseado em roles, especialmente focado nas restrições para usuários com perfil de aluno.

## Pré-requisitos

- Backend configurado e rodando
- Usuários de teste criados com diferentes roles:
  - Um usuário com role "aluno"
  - Um usuário com role "professor" ou "coordenador" ou "admin"

## Cenários de Teste

### 1. Login e Notificação de Boas-Vindas

**Como Aluno:**
```
1. Acesse /login
2. Faça login com credenciais de aluno
3. Verifique:
   ✓ Redirecionamento para /home
   ✓ Notificação verde de sucesso: "Login realizado com sucesso! Bem-vindo aluno!"
   ✓ NavBar mostra apenas "Home" e "Disponibilidade"
   ✓ Mensagem informativa sobre restrições aparece na NavBar
```

**Como Professor/Coordenador/Admin:**
```
1. Acesse /login
2. Faça login com credenciais de professor/coordenador/admin
3. Verifique:
   ✓ Redirecionamento para /home
   ✓ Notificação de sucesso com o perfil correto
   ✓ NavBar mostra todos os links (incluindo cadastros)
   ✓ Sem mensagem de restrição na NavBar
```

### 2. Tentativa de Acesso a Página Restrita (Aluno)

**Teste 1: Via URL Direta**
```
1. Faça login como aluno
2. Na barra de endereços, digite manualmente: /cadastroPaciente
3. Verifique:
   ✓ Redirecionamento automático para /home
   ✓ Notificação de erro vermelha aparece
   ✓ Mensagem: "Acesso negado! Você não tem permissão para acessar cadastroPaciente..."
   ✓ URL volta para /home (sem query parameters visíveis após a notificação)
```

**Teste 2: Outras Páginas Restritas**
```
Repita o teste acima para:
- /cadastroUsuario
- /cadastroConsulta

Para cada uma, verifique:
✓ Redirecionamento para /home
✓ Notificação de erro específica
✓ Mensagem clara sobre a restrição
```

### 3. Acesso a Páginas Permitidas (Aluno)

```
1. Faça login como aluno
2. Acesse /home
   ✓ Página carrega normalmente
   ✓ Calendário é exibido
   ✓ Sem mensagens de erro

3. Acesse /disponibilidade
   ✓ Página carrega normalmente
   ✓ Conteúdo é exibido
   ✓ Sem restrições
```

### 4. Navegação pela NavBar

**Como Aluno:**
```
1. Faça login como aluno
2. Observe a NavBar:
   ✓ Links visíveis: "Home" e "Disponibilidade"
   ✓ Links ausentes: "Cadastro de Paciente", "Cadastro de Usuário", "Cadastro de Consulta"
   ✓ Mensagem informativa presente:
     "Acesso Restrito
      Como aluno, você tem acesso apenas à Home e Disponibilidade."
```

**Como Professor/Coordenador/Admin:**
```
1. Faça login com perfil privilegiado
2. Observe a NavBar:
   ✓ Todos os links visíveis
   ✓ Sem mensagem de restrição
   ✓ Pode clicar em qualquer link e acessar a página
```

### 5. Expiração de Token

```
1. Faça login normalmente
2. Aguarde o token expirar (ou force expirando pelo DevTools)
3. Tente acessar /home ou qualquer outra rota protegida
4. Verifique:
   ✓ Redirecionamento para /login
   ✓ Notificação: "Seu token de autenticação é inválido ou expirou..."
   ✓ Token foi removido dos cookies
```

### 6. Token Inválido

```
1. No DevTools, modifique o cookie 'token' para um valor inválido
2. Tente acessar qualquer rota protegida
3. Verifique:
   ✓ Redirecionamento para /login
   ✓ Notificação de erro sobre token inválido
   ✓ Cookie de token foi removido
```

### 7. Sem Token (Acesso Direto)

```
1. Sem estar logado, tente acessar diretamente:
   - /home
   - /disponibilidade
   - /cadastroPaciente
   
2. Verifique:
   ✓ Redirecionamento para /login
   ✓ Notificação: "Por favor, faça login para acessar esta página."
```

### 8. Logout

```
1. Faça login
2. Clique no botão "Sair" na NavBar
3. Verifique:
   ✓ Notificação verde: "Logout realizado com sucesso!"
   ✓ Redirecionamento para /login
   ✓ Token removido dos cookies
   
4. Tente acessar /home novamente
   ✓ Deve redirecionar para /login
```

### 9. Erro 401 na API

```
1. Faça login normalmente
2. Force um erro 401 (pode ser feito no backend ou simulado)
3. Verifique:
   ✓ Notificação: "Sua sessão expirou. Por favor, faça login novamente."
   ✓ Sistema detecta e trata o erro adequadamente
```

### 10. Carregamento de Dados na Home

```
1. Faça login normalmente
2. Observe o carregamento da página /home
3. Verifique:
   ✓ Calendário carrega corretamente
   ✓ Se houver erro de autenticação, notificação apropriada aparece
   ✓ Sem erros no console relacionados a token/auth
```

### 11. Verificação Client-Side em Páginas Protegidas

**Cenário Especial (caso o middleware falhe):**
```
1. Faça login como aluno
2. De alguma forma, consiga acessar /cadastroPaciente (burlar o middleware)
3. Verifique:
   ✓ Notificação de erro aparece: "Acesso negado! Alunos não têm permissão..."
   ✓ Redirecionamento automático para /home após 2 segundos
```

## Checklist de Validação Geral

### Funcionalidade
- [ ] Alunos podem acessar apenas Home e Disponibilidade
- [ ] Alunos são bloqueados de acessar páginas de cadastro
- [ ] Professor/Coordenador/Admin têm acesso completo
- [ ] Notificações aparecem em todos os cenários
- [ ] Redirecionamentos funcionam corretamente

### Segurança
- [ ] Middleware valida tokens corretamente
- [ ] Tokens inválidos são rejeitados
- [ ] Tokens expirados são tratados
- [ ] Verificação client-side complementa a segurança
- [ ] Sem vulnerabilidades encontradas pelo CodeQL

### UX (User Experience)
- [ ] Mensagens de erro são claras e específicas
- [ ] NavBar se adapta ao role do usuário
- [ ] Notificações são visíveis e legíveis
- [ ] Transições são suaves
- [ ] Feedback é imediato

### Performance
- [ ] Validação não adiciona latência perceptível
- [ ] Verificações de auth não causam loops
- [ ] Dados carregam corretamente na home

## Ferramentas de Teste

### DevTools (Chrome/Firefox)
- **Application/Storage**: Inspecionar cookies (token)
- **Network**: Verificar chamadas de API e headers
- **Console**: Observar erros e warnings

### Endpoints de Teste
```
GET /home
GET /disponibilidade
GET /cadastroPaciente
GET /cadastroUsuario
GET /cadastroConsulta
POST /auth/login
```

## Resultados Esperados

### ✅ Sucesso
- Todos os testes passam
- Notificações apropriadas aparecem
- Redirecionamentos funcionam
- Segurança é mantida
- UX é positiva

### ❌ Falha
Se algum teste falhar:
1. Verificar logs do console
2. Inspecionar network requests
3. Validar token no cookie
4. Checar resposta da API
5. Revisar código do middleware e cliente

## Notas Importantes

1. **Dupla Camada de Segurança**: Middleware (servidor) + Verificação client-side
2. **Notificações Centralizadas**: Todas usam o componente Notification.tsx
3. **Tokens JWT**: Verificar se o backend está retornando o campo 'role' corretamente
4. **Cache**: Limpar cache se comportamento estranho ocorrer
5. **Sessão**: Notificações usam sessionStorage para flags temporárias

## Problemas Conhecidos

- Se o backend não retornar o campo 'role' no token, o sistema vai falhar
- Tokens sem os campos obrigatórios (id, email, role) serão rejeitados
- Navegação muito rápida pode causar múltiplas notificações (comportamento normal)

## Suporte

Para problemas durante os testes, verificar:
1. Logs do console do navegador
2. Logs do servidor Next.js
3. Logs do backend
4. Estrutura do token JWT retornado pelo backend
