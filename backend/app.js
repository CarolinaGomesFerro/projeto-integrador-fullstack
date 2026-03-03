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

// Novo Endpoint 1: Relatorio de Estoque Baixo
app.get('/api/relatorios/estoque-baixo', (req, res) => {
  const limite = parseInt(req.query.limite) || 10;
  const produtosBaixoEstoque = db.produtos
    .filter(p => p.quantidade_estoque <= limite)
    .map(p => ({
      id: p.id,
      nome: p.nome,
      categoria: p.categoria,
      quantidade_estoque: p.quantidade_estoque,
      preco: p.preco,
      status: p.quantidade_estoque === 0 ? 'CRITICO' : 'BAIXO',
    }))
    .sort((a, b) => a.quantidade_estoque - b.quantidade_estoque);
  res.json({
    limite_utilizado: limite,
    total_produtos_baixo_estoque: produtosBaixoEstoque.length,
    produtos: produtosBaixoEstoque,
  });
});

// Novo Endpoint 2: Estatisticas Gerais
app.get('/api/estatisticas', (req, res) => {
  const totalProdutos = db.produtos.length;
  const totalFornecedores = db.fornecedores.length;
  const totalAssociacoes = db.associacoes.length;
  const valorTotalEstoque = db.produtos.reduce((sum, p) => sum + (p.preco || 0) * p.quantidade_estoque, 0);
  const totalItensEstoque = db.produtos.reduce((sum, p) => sum + p.quantidade_estoque, 0);
  const categorias = {};
  db.produtos.forEach(p => {
    categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
  });
  const produtosComAssoc = new Set(db.associacoes.map(a => a.produto_id));
  const produtosSemFornecedor = db.produtos
    .filter(p => !produtosComAssoc.has(p.id))
    .map(p => ({ id: p.id, nome: p.nome }));
  res.json({
    total_produtos: totalProdutos,
    total_fornecedores: totalFornecedores,
    total_associacoes: totalAssociacoes,
    valor_total_estoque: Math.round(valorTotalEstoque * 100) / 100,
    total_itens_estoque: totalItensEstoque,
    produtos_por_categoria: categorias,
    produtos_sem_fornecedor: produtosSemFornecedor,
  });
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
