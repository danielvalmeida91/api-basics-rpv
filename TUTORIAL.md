# Construindo sua Primeira API REST com Node.js, Express e TypeScript

> **Nível:** Iniciante  
> **Tempo estimado:** 1h30  
> **Pré-requisitos:** Node.js instalado, noções básicas de JavaScript

---

## O que vamos aprender?

Neste tutorial você vai entender os fundamentos de APIs e HTTP, configurar um projeto TypeScript do zero com boas práticas e subir um servidor Express com uma rota tipada. Ao final, terá exatamente a estrutura deste repositório funcionando na sua máquina.

---

## Parte 1 — Fundamentos: O que é uma API?

### API — Application Programming Interface

Uma **API** é uma interface que permite que dois sistemas se comuniquem. Pense nela como um garçom em um restaurante: você (o cliente) não entra na cozinha para pegar sua comida, você faz um pedido ao garçom, ele leva à cozinha e traz o resultado de volta.

No contexto web, a API recebe **requisições HTTP** de um cliente (navegador, aplicativo mobile, outro servidor) e devolve **respostas**, geralmente em formato JSON.

```
Cliente                 Servidor
  |  --  GET /usuarios -->  |
  |  <-- 200 OK + JSON  --  |
```

### O Protocolo HTTP

HTTP (*HyperText Transfer Protocol*) é o protocolo de comunicação da web. Toda requisição HTTP é composta por:

| Componente | Descrição | Exemplo |
|---|---|---|
| **Método** | A intenção da requisição | `GET`, `POST`, `PUT`, `DELETE` |
| **URL** | O recurso que está sendo acessado | `http://localhost:3000/usuarios` |
| **Headers** | Metadados da requisição | `Content-Type: application/json` |
| **Body** | Dados enviados (quando aplicável) | `{ "nome": "Daniel" }` |

#### Métodos HTTP (Verbos)

```
GET     → Buscar/ler um recurso          (não altera dados)
POST    → Criar um novo recurso          (envia dados no body)
PUT     → Substituir um recurso inteiro  (envia dados no body)
PATCH   → Atualizar parte de um recurso  (envia dados no body)
DELETE  → Remover um recurso             (geralmente sem body)
```

### HTTP Status Codes (Códigos de Status)

Toda resposta HTTP vem acompanhada de um código de 3 dígitos que indica o resultado da operação. Eles são agrupados em famílias:

#### 2xx — Sucesso ✅

| Código | Nome | Quando usar |
|---|---|---|
| `200` | OK | Requisição bem-sucedida (padrão para GET) |
| `201` | Created | Recurso criado com sucesso (padrão para POST) |
| `204` | No Content | Sucesso, mas sem corpo na resposta (comum em DELETE) |

#### 3xx — Redirecionamentos 🔄

| Código | Nome | Quando usar |
|---|---|---|
| `301` | Moved Permanently | URL do recurso mudou permanentemente |
| `302` | Found | Redirecionamento temporário |

#### 4xx — Erros do Cliente ❌

| Código | Nome | Quando usar |
|---|---|---|
| `400` | Bad Request | Dados enviados pelo cliente são inválidos |
| `401` | Unauthorized | Não autenticado (precisa fazer login) |
| `403` | Forbidden | Autenticado, mas sem permissão |
| `404` | Not Found | Recurso não encontrado |
| `409` | Conflict | Conflito (ex: e-mail já cadastrado) |
| `422` | Unprocessable Entity | Dados válidos, mas semanticamente incorretos |

#### 5xx — Erros do Servidor 🔥

| Código | Nome | Quando usar |
|---|---|---|
| `500` | Internal Server Error | Erro genérico no servidor |
| `502` | Bad Gateway | Servidor intermediário recebeu resposta inválida |
| `503` | Service Unavailable | Servidor temporariamente indisponível |

> **Dica:** Uma boa API utiliza os status codes corretamente. Nunca retorne `200 OK` com `{ "error": true }` no corpo — isso confunde quem consome sua API.

### REST — O padrão arquitetural

**REST** (*Representational State Transfer*) é um conjunto de princípios para construir APIs HTTP de forma padronizada. Uma API RESTful organiza seus recursos em URLs e usa os métodos HTTP para definir as operações:

```
GET    /produtos          → lista todos os produtos
POST   /produtos          → cria um produto
GET    /produtos/:id      → busca um produto pelo ID
PUT    /produtos/:id      → atualiza um produto completo
PATCH  /produtos/:id      → atualiza campos específicos
DELETE /produtos/:id      → remove um produto
```

---

## Parte 2 — Configurando o Ambiente

### Por que pnpm?

O **pnpm** é um gerenciador de pacotes moderno que resolve dois problemas históricos do npm:

1. **Espaço em disco:** O pnpm usa um *store* global e cria links simbólicos. O mesmo pacote nunca é baixado duas vezes na mesma máquina.
2. **Velocidade:** Por reutilizar o cache, instalações subsequentes são significativamente mais rápidas.

Comparativo rápido:

```
npm install    → copia pacotes para node_modules de cada projeto
yarn install   → similar ao npm, com melhorias de cache
pnpm install   → usa hard links para um store central (muito mais eficiente)
```

#### Instalando o pnpm

```bash
# Via npm (recomendado para o primeiro setup)
npm install -g pnpm

# Verificar instalação
pnpm --version
```

### Por que TypeScript?

JavaScript é uma linguagem de tipagem dinâmica — erros de tipo só aparecem em tempo de execução. O **TypeScript** adiciona tipagem estática ao JavaScript, antecipando erros em tempo de desenvolvimento.

```typescript
// JavaScript — erro só aparece quando o código roda
function somar(a, b) {
    return a + b;
}
somar(2, "3") // retorna "23" silenciosamente

// TypeScript — erro apontado pelo editor antes de rodar
function somar(a: number, b: number): number {
    return a + b;
}
somar(2, "3") // Erro: Argument of type 'string' is not assignable to 'number'
```

---

## Parte 3 — Criando o Projeto do Zero

### Passo 1 — Inicializar o projeto

```bash
mkdir aula01
cd aula01
pnpm init
```

O `pnpm init` cria o `package.json`. Abra-o e ajuste conforme necessário. O `packageManager` será definido automaticamente ao usar o pnpm.

### Passo 2 — Instalar as dependências

```bash
# Dependência de produção: o framework web
pnpm add express

# Dependências de desenvolvimento: TypeScript e ferramentas de tipo
pnpm add -D typescript ts-node-dev @types/node @types/express
```

**O que cada pacote faz:**

| Pacote | Função |
|---|---|
| `express` | Framework web minimalista para Node.js |
| `typescript` | Compilador TypeScript |
| `ts-node-dev` | Executa TypeScript diretamente + reinicia ao salvar (equivalente ao nodemon para TS) |
| `@types/node` | Tipagens do Node.js (ex: `process`, `Buffer`) |
| `@types/express` | Tipagens do Express (`Request`, `Response`, etc.) |

### Passo 3 — Configurar o TypeScript

A configuração do TypeScript fica no arquivo `tsconfig.json`. Em vez de escrever tudo do zero, usamos como referência a base da comunidade documentada pelo repositório [`tsconfig/bases`](https://github.com/tsconfig/bases) — um projeto que mantém configurações recomendadas para diferentes ambientes.

Para um projeto Node.js moderno (Node 22+), a configuração recomendada é:

Crie o arquivo `tsconfig.json` na raiz do projeto:

```json
{
  "$schema": "https://www.schemastore.org/tsconfig",
  "_version": "24.0.0",

  "compilerOptions": {
    "lib": [
      "es2024",
      "ESNext.Array",
      "ESNext.Collection",
      "ESNext.Error",
      "ESNext.Iterator",
      "ESNext.Promise"
    ],
    "module": "nodenext",
    "target": "es2024",

    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node16",
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

**Explicando as opções mais importantes:**

| Opção | Valor | O que faz |
|---|---|---|
| `target` | `es2024` | Compila para a versão ES2024 do JavaScript |
| `module` | `nodenext` | Usa o sistema de módulos do Node.js moderno (ESM/CJS) |
| `moduleResolution` | `node16` | Como o TypeScript resolve importações (compatível com Node 16+) |
| `strict` | `true` | Ativa todas as verificações rigorosas de tipo (recomendado) |
| `esModuleInterop` | `true` | Permite importar módulos CommonJS com sintaxe `import` padrão |
| `skipLibCheck` | `true` | Ignora erros de tipo em arquivos `.d.ts` de terceiros |
| `rootDir` | `./src` | Onde ficam os arquivos TypeScript |
| `outDir` | `./dist` | Onde o compilador gera os arquivos JavaScript |

> **Por que `strict: true`?** Ativa um conjunto de verificações como `strictNullChecks` (previne erros com `null`/`undefined`), `noImplicitAny` (força tipagem explícita) e outras. É a configuração recomendada para qualquer projeto novo.

### Passo 4 — Configurar os scripts no package.json

Adicione a seção `scripts` ao seu `package.json`:

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

**O que cada script faz:**

- `dev` — inicia o servidor em modo desenvolvimento com hot-reload (`--respawn` reinicia ao detectar mudanças, `--transpile-only` pula a verificação de tipos para ser mais rápido)
- `build` — compila o TypeScript para JavaScript na pasta `dist/`
- `start` — inicia o servidor a partir do JavaScript compilado (usado em produção)

### Passo 5 — Criar a estrutura de pastas

```bash
mkdir src
```

### Passo 6 — Criar as tipagens (`src/types.ts`)

Antes de criar o servidor, defina as interfaces TypeScript que garantirão consistência nas respostas da API.

Crie o arquivo `src/types.ts`:

```typescript
// Criamos uma tipagem para o objeto de resposta padrão da nossa API.
// O uso de Generics (<T>) torna a interface reutilizável para qualquer tipo de dado.

export interface IResponse<T> {
    data: {
        infos: T
    }
    error: boolean
}
```

**Entendendo Generics em TypeScript:**

O `<T>` é um *Generic* — um "coringa" de tipo. Quando usarmos `IResponse<{ nome: string }>`, o TypeScript vai substituir `T` por `{ nome: string }`, garantindo que `infos` seja exatamente esse tipo.

```typescript
// Sem generic — interface pouco útil
interface IResponse {
    data: {
        infos: any // qualquer coisa, sem segurança de tipo
    }
    error: boolean
}

// Com generic — interface reutilizável e com segurança de tipo
interface IResponse<T> {
    data: {
        infos: T // o tipo é definido em cada uso
    }
    error: boolean
}
```

### Passo 7 — Criar o servidor Express (`src/index.ts`)

Crie o arquivo `src/index.ts`:

```typescript
import express, { Request, Response } from 'express'
import { IResponse } from './types';

const app = express();
const PORT = 3000;

// Middleware para que o Express consiga ler o body de requisições JSON
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    // Usamos o generic para garantir que o formato da resposta está correto
    const createResponse: IResponse<{nome: string}> = {
        data: {
            infos: {
                nome: 'Daniel Ventura de Almeida'
            }
        },
        error: false
    }

    res.json(createResponse)
})

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
})
```

**Dissecando o código:**

1. **`express()`** — cria uma instância do servidor
2. **`app.use(express.json())`** — registra um *middleware* que faz o parse do body JSON nas requisições
3. **`app.get('/', callback)`** — registra uma rota que responde requisições `GET` na URL `/`
4. **`req: Request, res: Response`** — tipagem do Express para os objetos de requisição e resposta
5. **`IResponse<{nome: string}>`** — usamos o generic para garantir que `infos` é `{ nome: string }`
6. **`res.json()`** — serializa o objeto para JSON e envia a resposta com `Content-Type: application/json`
7. **`app.listen(PORT)`** — inicia o servidor HTTP na porta 3000

### Passo 8 — Testar a API (arquivo `routes.http`)

O arquivo `routes.http` permite testar a API diretamente no VS Code com a extensão **REST Client** (humao.rest-client).

Crie o arquivo `routes.http` na raiz do projeto:

```http
GET http://localhost:3000
```

Com a extensão instalada, aparece um botão "Send Request" acima de cada requisição. Clique nele com o servidor rodando.

---

## Parte 4 — Rodando o Projeto

### Iniciando em modo desenvolvimento

```bash
pnpm dev
```

Você deve ver no terminal:

```
[INFO] Starting compilation in watch mode...
[INFO] Found 0 errors. Watching for file changes.
Servidor rodando em http://localhost:3000
```

### Testando com o REST Client

Abra o arquivo `routes.http` e clique em **Send Request**. A resposta esperada é:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "infos": {
      "nome": "Daniel Ventura de Almeida"
    }
  },
  "error": false
}
```

### Compilando para produção

```bash
pnpm build    # gera os arquivos em dist/
pnpm start    # inicia o servidor a partir do dist/
```

---

## Estrutura final do projeto

```
aula01/
├── src/
│   ├── index.ts       # ponto de entrada do servidor
│   └── types.ts       # interfaces e tipagens compartilhadas
├── dist/              # gerado após pnpm build (não versionar)
├── node_modules/      # dependências (não versionar)
├── package.json       # metadados e scripts do projeto
├── pnpm-lock.yaml     # lockfile do pnpm (versionar)
├── routes.http        # testes de rota com REST Client
└── tsconfig.json      # configuração do TypeScript
```

> **Atenção:** Adicione ao seu `.gitignore` as pastas `node_modules/` e `dist/`, pois elas são geradas automaticamente e não devem ser versionadas.

---

## Resumo e próximos passos

Neste tutorial você aprendeu a:

- [x] Compreender o que é uma API REST e como funciona o protocolo HTTP
- [x] Identificar e utilizar os principais HTTP Status Codes
- [x] Configurar um projeto Node.js com pnpm
- [x] Configurar o TypeScript com boas práticas usando como referência o `tsconfig/bases`
- [x] Criar uma rota Express com tipagem TypeScript usando Generics
- [x] Testar a API com o REST Client do VS Code

**Para aprofundar:**

- Adicione mais rotas (`POST /`, `GET /:id`) e explore os outros verbos HTTP
- Implemente tratamento de erros com os status codes `4xx`
- Explore a documentação do [tsconfig/bases](https://github.com/tsconfig/bases) para outros ambientes
- Conheça o [Zod](https://zod.dev) para validação de dados em tempo de execução

---

*Bons estudos!*
