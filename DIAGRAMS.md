# Diagramas do Sistema de Controle de Acesso

## 1. Fluxo de Autenticação e Validação de Token

```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │
       │ 1. Faz Login
       ▼
┌─────────────────────┐
│   Página de Login   │
│  (/login/page.tsx)  │
└──────┬──────────────┘
       │
       │ 2. POST /auth/login
       ▼
┌─────────────────────┐
│      Backend        │
│   (API Externa)     │
└──────┬──────────────┘
       │
       │ 3. Retorna Token JWT
       │    { id, email, role, perfil_id, iat, exp }
       ▼
┌─────────────────────┐
│   Set Cookie Token  │
│  + localStorage     │
└──────┬──────────────┘
       │
       │ 4. Redirect para /home
       ▼
┌─────────────────────┐
│    Middleware       │
│  (middleware.ts)    │
└──────┬──────────────┘
       │
       │ 5. Valida Token
       ├─── Token inválido → Redirect /login?reason=invalid_token
       ├─── Token expirado → Redirect /login?reason=invalid_token
       ├─── Sem permissão → Redirect /home?accessDenied=true
       └─── Token válido → Permite acesso
       ▼
┌─────────────────────┐
│   Página Destino    │
│   (Home, etc)       │
└─────────────────────┘
```

## 2. Fluxo de Acesso para Aluno (Role: "aluno")

```
┌─────────────────────────────────────────────────────────┐
│                    Usuário Aluno Logado                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    /home        /disponibilidade    /cadastroPaciente
        │                │                │
        │                │                │
    ✅ PERMITIDO     ✅ PERMITIDO      ❌ BLOQUEADO
        │                │                │
        │                │                │
        ▼                ▼                ▼
┌───────────────┐ ┌───────────────┐ ┌──────────────────┐
│ Mostra        │ │ Mostra        │ │ Middleware       │
│ Calendário    │ │ Horários      │ │ Intercepta       │
│               │ │               │ │                  │
│ NavBar:       │ │ NavBar:       │ │ Redirect:        │
│ - Home        │ │ - Home        │ │ /home?           │
│ - Disponib.   │ │ - Disponib.   │ │ accessDenied=    │
│ - [Msg Info]  │ │ - [Msg Info]  │ │ true&            │
│               │ │               │ │ attemptedRoute=  │
│               │ │               │ │ /cadastroPaciente│
└───────────────┘ └───────────────┘ └────────┬─────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │ Home Page        │
                                    │                  │
                                    │ useSearchParams  │
                                    │ detecta redirect │
                                    │                  │
                                    │ Mostra:          │
                                    │ 🔴 Notificação   │
                                    │ "Acesso negado!" │
                                    └──────────────────┘
```

## 3. Fluxo de Acesso para Professor/Coordenador/Admin

```
┌─────────────────────────────────────────────────────────┐
│              Usuário Privilegiado Logado                 │
│            (Role: professor/coordenador/admin)           │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Acesso Total a Todas as Páginas
                         │
        ┌────────────────┼────────────────┬────────────────┐
        │                │                │                │
        ▼                ▼                ▼                ▼
    /home        /disponibilidade   /cadastroPaciente  /cadastroUsuario
        │                │                │                │
        │                │                │                │
    ✅ PERMITIDO     ✅ PERMITIDO     ✅ PERMITIDO     ✅ PERMITIDO
        │                │                │                │
        ▼                ▼                ▼                ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Mostra        │ │ Mostra        │ │ Mostra        │ │ Mostra        │
│ Calendário    │ │ Horários      │ │ Formulário    │ │ Formulário    │
│               │ │               │ │ de Cadastro   │ │ de Cadastro   │
│ NavBar:       │ │ NavBar:       │ │               │ │               │
│ - Home        │ │ - Home        │ │ NavBar:       │ │ NavBar:       │
│ - Disponib.   │ │ - Disponib.   │ │ - Home        │ │ - Home        │
│ - Cad. Pac.   │ │ - Cad. Pac.   │ │ - Disponib.   │ │ - Disponib.   │
│ - Cad. Usu.   │ │ - Cad. Usu.   │ │ - Cad. Pac.   │ │ - Cad. Pac.   │
│ - Cad. Cons.  │ │ - Cad. Cons.  │ │ - Cad. Usu.   │ │ - Cad. Usu.   │
│               │ │               │ │ - Cad. Cons.  │ │ - Cad. Cons.  │
└───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘
```

## 4. Validação de Token no Middleware

```
┌──────────────────────────────────┐
│     Requisição Entrada           │
│     (req: NextRequest)           │
└────────────┬─────────────────────┘
             │
             ▼
      ┌──────────────┐
      │ Extrai Token │
      │ do Cookie    │
      └──────┬───────┘
             │
             ▼
      ┌──────────────┐      Não
      │ Token Existe?├─────────────┐
      └──────┬───────┘              │
             │ Sim                   │
             ▼                       ▼
      ┌──────────────┐       ┌─────────────────┐
      │ Decodifica   │       │ Redirect /login │
      │ JWT          │       │ ?reason=no_token│
      └──────┬───────┘       └─────────────────┘
             │
             ▼
      ┌──────────────┐      Não
      │ Token Válido?├─────────────┐
      │ (campos      │              │
      │  obrigatórios│              │
      │  presentes?) │              │
      └──────┬───────┘              │
             │ Sim                   │
             ▼                       ▼
      ┌──────────────┐       ┌─────────────────────┐
      │ Token        │       │ Redirect /login     │
      │ Expirado?    ├───Sim─┤ ?reason=            │
      │              │       │  invalid_token      │
      └──────┬───────┘       │ + Delete Cookie     │
             │ Não            └─────────────────────┘
             ▼
      ┌──────────────┐
      │ Verifica     │
      │ Permissão    │
      │ para Rota    │
      └──────┬───────┘
             │
             ▼
      ┌──────────────┐      Não
      │ Tem Permissão├─────────────┐
      │ (hasRoute    │              │
      │  Permission) │              │
      └──────┬───────┘              │
             │ Sim                   │
             ▼                       ▼
      ┌──────────────┐       ┌─────────────────────┐
      │ Permite      │       │ Redirect /home      │
      │ Acesso       │       │ ?accessDenied=true  │
      │              │       │ &attemptedRoute=    │
      │ next()       │       │  [pathname]         │
      └──────────────┘       └─────────────────────┘
```

## 5. Matriz de Permissões por Rota

```
┌───────────────────┬───────┬───────────┬─────────────┬────────┐
│      Rota         │ Aluno │ Professor │ Coordenador │ Admin  │
├───────────────────┼───────┼───────────┼─────────────┼────────┤
│ /home             │  ✅   │    ✅     │     ✅      │   ✅   │
├───────────────────┼───────┼───────────┼─────────────┼────────┤
│ /disponibilidade  │  ✅   │    ✅     │     ✅      │   ✅   │
├───────────────────┼───────┼───────────┼─────────────┼────────┤
│ /cadastroPaciente │  ❌   │    ✅     │     ✅      │   ✅   │
├───────────────────┼───────┼───────────┼─────────────┼────────┤
│ /cadastroUsuario  │  ❌   │    ✅     │     ✅      │   ✅   │
├───────────────────┼───────┼───────────┼─────────────┼────────┤
│ /cadastroConsulta │  ❌   │    ✅     │     ✅      │   ✅   │
└───────────────────┴───────┴───────────┴─────────────┴────────┘

Legenda:
✅ = Acesso Permitido
❌ = Acesso Negado (Redirect com notificação)
```

## 6. Fluxo de Notificações

```
┌─────────────────────────────────────────────────────────┐
│                    Evento Dispara                        │
└────────────────────────┬────────────────────────────────┘
                         │
           ┌─────────────┼─────────────┬─────────────┐
           │             │             │             │
           ▼             ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Access   │  │ Invalid  │  │ Session  │  │ API      │
    │ Denied   │  │ Token    │  │ Expired  │  │ Error    │
    └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
         │             │             │             │
         ▼             ▼             ▼             ▼
    ┌─────────────────────────────────────────────────────┐
    │          useNotification Hook                       │
    │          (NotificationContext)                      │
    └────────────────────────┬────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ showNotification│
                    │ (type, message) │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
         ┌──────────┐ ┌──────────┐ ┌──────────┐
         │ success  │ │  error   │ │ warning  │
         │ (verde)  │ │(vermelho)│ │(amarelo) │
         └────┬─────┘ └────┬─────┘ └────┬─────┘
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Notification.tsx     │
                │ Component            │
                │                      │
                │ - Aparece top-right  │
                │ - Auto-fecha 5s      │
                │ - Pode fechar manual │
                │ - Animação smooth    │
                └──────────────────────┘
```

## 7. Estrutura de Segurança em Camadas

```
┌─────────────────────────────────────────────────────────┐
│                     Requisição HTTP                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
           ┌─────────────────────────────┐
           │   Camada 1: Middleware      │
           │   (Server-side)             │
           │   - Valida Token JWT        │
           │   - Verifica Expiração      │
           │   - Valida Campos           │
           │   - Verifica Permissões     │
           │   ✅ Bloqueia no Servidor   │
           └────────────┬────────────────┘
                        │
                        ▼
           ┌─────────────────────────────┐
           │   Camada 2: Página React    │
           │   (Client-side)             │
           │   - usePermissions Hook     │
           │   - Verifica Role           │
           │   - Mostra Notificação      │
           │   - Redireciona se Aluno    │
           │   ✅ UX Melhorada           │
           └────────────┬────────────────┘
                        │
                        ▼
           ┌─────────────────────────────┐
           │   Camada 3: API Interceptor │
           │   (axios)                   │
           │   - Adiciona Token Header   │
           │   - Trata Erro 401          │
           │   - Trata Erro 403          │
           │   - Limpa Token Inválido    │
           │   ✅ Tratamento Global      │
           └────────────┬────────────────┘
                        │
                        ▼
           ┌─────────────────────────────┐
           │   Backend API               │
           │   (Servidor Externo)        │
           │   - Valida Token            │
           │   - Verifica Permissões     │
           │   - Processa Requisição     │
           │   ✅ Autoridade Final       │
           └─────────────────────────────┘
```

## 8. NavBar Adaptativa

```
┌─────────────────────────────────────────────────────────┐
│                      NavBar Component                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ usePermissions│
                  │ Hook         │
                  └──────┬───────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
  ┌──────────────┐              ┌──────────────┐
  │ isAluno()    │              │ hasFullAccess│
  │ = true       │              │ () = true    │
  └──────┬───────┘              └──────┬───────┘
         │                               │
         ▼                               ▼
┌─────────────────┐           ┌──────────────────┐
│ NavBar (Aluno)  │           │ NavBar (Completo)│
│                 │           │                  │
│ 📋 Home         │           │ 📋 Home          │
│ 📅 Disponib.    │           │ 📅 Disponib.     │
│                 │           │ 👤 Cad. Paciente │
│ ℹ️ [Mensagem]   │           │ 👥 Cad. Usuário  │
│   Acesso        │           │ 📝 Cad. Consulta │
│   Restrito      │           │                  │
│                 │           │                  │
│ 🚪 Sair         │           │ 🚪 Sair          │
└─────────────────┘           └──────────────────┘
```

## Legenda

```
✅ = Permitido / Sucesso
❌ = Bloqueado / Erro
🔴 = Notificação de Erro
🟢 = Notificação de Sucesso
🟡 = Notificação de Aviso
📋 = Link de Navegação
ℹ️ = Informação
```
