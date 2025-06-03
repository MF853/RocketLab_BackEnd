# RocketLab E-commerce API

API de e-commerce desenvolvida com NestJS, Prisma e PostgreSQL. Oferece funcionalidades de autenticação, gerenciamento de produtos e carrinho de compras.

## Principais Recursos

- Autenticação com JWT
- Gerenciamento de produtos
- Carrinho de compras
- Controle de estoque
- Diferentes níveis de acesso (Admin/User)

## Pré-requisitos

- Node.js (v18 ou superior)
- PostgreSQL
- NPM ou Yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/MF853/RocketLab_BackEnd.git
cd RocketLab_BackEnd
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis com suas configurações

```bash
cp .env.example .env
```

Exemplo de `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rocketlab?schema=public"
JWT_SECRET="sua-chave-secreta"
PORT=3000
```

## Banco de Dados

### Gerar o banco de dados
```bash
npx prisma generate
npx prisma migrate dev
```

### Zerar o banco de dados
```bash
npx prisma migrate reset
```

### Abrir Prisma Studio
```bash
npx prisma studio
```
O Prisma Studio estará disponível em: http://localhost:5555

## Rodando o Projeto

### Desenvolvimento
```bash
npm run start:dev
```

### Produção
```bash
npm run build
npm run start:prod
```

O servidor estará rodando em: http://localhost:3000

## Documentação da API (Swagger)

A documentação completa da API está disponível em:
http://localhost:3000/api

## Testes

### Testes Unitários
```bash
# Rodar todos os testes
npm run test

# Rodar testes com coverage
npm run test:cov

# Rodar testes em watch mode
npm run test:watch
```

### Testes E2E
```bash
npm run test:e2e
```

## Estrutura do Projeto

```
src/
├── auth/           # Autenticação e autorização
├── product/        # Gerenciamento de produtos
├── cart/           # Carrinho de compras
├── prisma/         # Schemas e migrações do banco
└── common/         # Código compartilhado
```

## Endpoints Principais

### Autenticação
- POST /auth/login - Login de usuário
- POST /auth/register - Registro de novo usuário
- POST /auth/register-admin - Registro de administrador

### Produtos
- GET /products - Listar produtos
- POST /products - Criar produto (Admin)
- GET /products/:id - Buscar produto
- PATCH /products/:id - Atualizar produto (Admin)
- DELETE /products/:id - Remover produto (Admin)

### Carrinho
- POST /cart - Criar carrinho
- GET /cart/my-cart - Buscar carrinho do usuário
- POST /cart/:id/items - Adicionar item ao carrinho
- DELETE /cart/:cartId/items/:productId - Remover item do carrinho
- DELETE /cart/:id - Remover carrinho
