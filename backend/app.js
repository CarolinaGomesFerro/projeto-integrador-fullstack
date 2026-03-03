const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files (built React app)
const frontendPath = path.join(__dirname, 'public');
app.use(express.static(frontendPath));

// In-memory database (no native modules - works on StackBlitz)
const db = {
  produtos: [],
  fornecedores: [],
  associacoes: [],
  nextProdutoId: 1,
  nextFornecedorId: 1,
  nextAssociacaoId: 1,
};

// Import routes
const produtoRoutes = require('./routes/produtos');
const fornecedorRoutes = require('./routes/fornecedores');
const associacaoRoutes = require('./routes/associacoes');

app.use('/api/produtos', produtoRoutes(db));
app.use('/api/fornecedores', fornecedorRoutes(db));
app.use('/api/associacoes', associacaoRoutes(db));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Servidor do Sistema de Controle de Estoque funcionando!' });
});

// Fallback to frontend for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ message: 'API do Sistema de Controle de Estoque funcionando! Frontend nao encontrado.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}/`);
});

module.exports = app;
