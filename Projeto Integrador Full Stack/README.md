# Projeto Integrador Full Stack - Sistema de Controle de Estoque
FACULDADE GRAN (https://faculdade.grancursosonline.com.br/) 
Projeto Disciplina Projeto Integrador

## Descrição
Sistema de pré-cadastro para controle de estoque desenvolvido como projeto integrador da faculdade de ADS. O sistema permite o cadastro de produtos, fornecedores e suas associações (relacionamento muitos-para-muitos).

## Tecnologias Utilizadas

### Backend
- Node.js com Express.js
- SQLite (banco de dados relacional)
- Multer (upload de imagens)

### Frontend
- React.js com TypeScript
- Vite (bundler)
- Tailwind CSS (estilização)
- React Router (navegação SPA)
- Lucide React (ícones)

## Estrutura do Projeto

```
projeto-integrador-fullstack/
├── backend/
│   ├── app.js                    # Servidor Express + config do banco
│   ├── routes/
│   │   ├── produtos.js           # CRUD de Produtos
│   │   ├── fornecedores.js       # CRUD de Fornecedores
│   │   └── associacoes.js        # Associações Produto/Fornecedor
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Rotas da aplicação
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Página inicial
│   │   │   ├── Produtos.tsx      # Cadastro de Produtos
│   │   │   ├── Fornecedores.tsx  # Cadastro de Fornecedores
│   │   │   └── Associacoes.tsx   # Associações
│   │   ├── components/
│   │   │   ├── Layout.tsx        # Layout com navegação
│   │   │   └── Toast.tsx         # Notificações
│   │   └── services/
│   │       └── api.ts            # Serviço de comunicação com API
│   └── package.json
└── README.md
```

## Como Executar

### 1. Backend
```bash
cd backend
npm install
node app.js
```
O servidor será iniciado na porta 3000.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
O frontend será iniciado em http://localhost:5173.

## Funcionalidades

### Produtos
- Cadastro com nome, código de barras, descrição, preço, quantidade, categoria, data de validade e imagem
- Validação de campos obrigatórios
- Código de barras único
- Upload de imagem do produto
- Busca por nome, código de barras ou categoria

### Fornecedores
- Cadastro com nome da empresa, CNPJ, endereço, telefone, e-mail e contato principal
- Formatação automática de CNPJ (XX.XXX.XXX/XXXX-XX)
- Formatação automática de telefone ((XX) XXXXX-XXXX)
- CNPJ único com validação
- Busca por nome, CNPJ ou e-mail

### Associações (Muitos-para-Muitos)
- Seleção de produto e associação com fornecedores
- Visualização dos fornecedores associados a cada produto
- Desassociação de fornecedores
- Prevenção de associações duplicadas

## Banco de Dados
O sistema utiliza SQLite com 3 tabelas:
- **produtos**: armazena os dados dos produtos
- **fornecedores**: armazena os dados dos fornecedores
- **produto_fornecedor**: tabela de junção para o relacionamento muitos-para-muitos

## Portas Locais
- Backend: http://localhost:3000
- Frontend: http://localhost:5173
