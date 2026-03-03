# Projeto Integrador Full Stack

## Sistema de Controle de Estoque

**Aluna:** Carolina Gomes Ferro  
**GitHub:** https://github.com/CarolinaGomesFerro/projeto-integrador-fullstack

### Estrutura do Projeto

```
├── backend/          # API REST (Node.js + Express)
│   ├── app.js        # Servidor principal
│   ├── routes/       # Rotas da API
│   │   ├── produtos.js
│   │   ├── fornecedores.js
│   │   └── associacoes.js
│   └── package.json
│
└── frontend/         # Interface Web (React + Vite + Tailwind)
    ├── src/
    │   ├── pages/    # Paginas (Home, Produtos, Fornecedores, Associacoes)
    │   ├── components/
    │   └── services/ # Chamadas API
    └── package.json
```

### API REST - Endpoints

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | /api/produtos | Listar todos os produtos |
| POST | /api/produtos | Cadastrar novo produto |
| PUT | /api/produtos/:id | Atualizar produto |
| DELETE | /api/produtos/:id | Excluir produto |
| GET | /api/fornecedores | Listar todos os fornecedores |
| POST | /api/fornecedores | Cadastrar novo fornecedor |
| PUT | /api/fornecedores/:id | Atualizar fornecedor |
| DELETE | /api/fornecedores/:id | Excluir fornecedor |
| GET | /api/associacoes | Listar todas as associacoes |
| POST | /api/associacoes | Associar fornecedor a produto |
| DELETE | /api/associacoes/:id | Remover associacao |

### Como Executar

#### Backend
```bash
cd backend
npm install
npm start
```
O servidor inicia em http://localhost:3000

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
O frontend inicia em http://localhost:5173

### Tecnologias Utilizadas

- **Backend:** Node.js, Express, armazenamento em memoria
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Deploy:** Fly.io (backend) + Frontend estatico
