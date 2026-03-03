const express = require('express');

module.exports = function(db) {
  const router = express.Router();

  // GET all associations
  router.get('/', (req, res) => {
    try {
      const associacoes = db.associacoes.map(a => {
        const produto = db.produtos.find(p => p.id === a.produto_id);
        const fornecedor = db.fornecedores.find(f => f.id === a.fornecedor_id);
        return {
          id: a.id,
          produto_id: a.produto_id,
          fornecedor_id: a.fornecedor_id,
          produto_nome: produto ? produto.nome : 'Produto removido',
          fornecedor_nome: fornecedor ? fornecedor.nome_empresa : 'Fornecedor removido',
          codigo_barras: produto ? produto.codigo_barras : null,
          cnpj: fornecedor ? fornecedor.cnpj : null,
          created_at: a.created_at,
        };
      }).sort((a, b) => b.id - a.id);
      res.json(associacoes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar associacoes.' });
    }
  });

  // GET fornecedores by produto
  router.get('/produto/:produtoId', (req, res) => {
    try {
      const produtoId = parseInt(req.params.produtoId);
      const produto = db.produtos.find(p => p.id === produtoId);
      if (!produto) {
        return res.status(404).json({ error: 'Produto nao encontrado.' });
      }

      const assocs = db.associacoes.filter(a => a.produto_id === produtoId);
      const fornecedores = assocs.map(a => {
        const f = db.fornecedores.find(f => f.id === a.fornecedor_id);
        if (!f) return null;
        return { ...f, associacao_id: a.id };
      }).filter(Boolean);

      res.json({ produto, fornecedores });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar fornecedores do produto.' });
    }
  });

  // GET produtos by fornecedor
  router.get('/fornecedor/:fornecedorId', (req, res) => {
    try {
      const fornecedorId = parseInt(req.params.fornecedorId);
      const fornecedor = db.fornecedores.find(f => f.id === fornecedorId);
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor nao encontrado.' });
      }

      const assocs = db.associacoes.filter(a => a.fornecedor_id === fornecedorId);
      const produtos = assocs.map(a => {
        const p = db.produtos.find(p => p.id === a.produto_id);
        if (!p) return null;
        return { ...p, associacao_id: a.id };
      }).filter(Boolean);

      res.json({ fornecedor, produtos });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar produtos do fornecedor.' });
    }
  });

  // POST associate fornecedor to produto
  router.post('/', (req, res) => {
    try {
      const { produto_id, fornecedor_id } = req.body;

      if (!produto_id || !fornecedor_id) {
        return res.status(400).json({ error: 'Produto e fornecedor sao obrigatorios.' });
      }

      // Check if produto exists
      const produto = db.produtos.find(p => p.id === parseInt(produto_id));
      if (!produto) {
        return res.status(404).json({ error: 'Produto nao encontrado.' });
      }

      // Check if fornecedor exists
      const fornecedor = db.fornecedores.find(f => f.id === parseInt(fornecedor_id));
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor nao encontrado.' });
      }

      // Check if association already exists
      const existing = db.associacoes.find(
        a => a.produto_id === parseInt(produto_id) && a.fornecedor_id === parseInt(fornecedor_id)
      );
      if (existing) {
        return res.status(409).json({ error: 'Fornecedor ja esta associado a este produto!' });
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const associacao = {
        id: db.nextAssociacaoId++,
        produto_id: parseInt(produto_id),
        fornecedor_id: parseInt(fornecedor_id),
        created_at: now,
      };

      db.associacoes.push(associacao);

      res.status(201).json({
        message: 'Fornecedor associado com sucesso ao produto!',
        associacao: {
          id: associacao.id,
          produto_id: associacao.produto_id,
          fornecedor_id: associacao.fornecedor_id,
          produto_nome: produto.nome,
          fornecedor_nome: fornecedor.nome_empresa,
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao associar fornecedor ao produto.' });
    }
  });

  // DELETE disassociate
  router.delete('/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const index = db.associacoes.findIndex(a => a.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Associacao nao encontrada.' });
      }

      db.associacoes.splice(index, 1);
      res.json({ message: 'Fornecedor desassociado com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao desassociar fornecedor.' });
    }
  });

  // DELETE by produto_id and fornecedor_id
  router.delete('/produto/:produtoId/fornecedor/:fornecedorId', (req, res) => {
    try {
      const produtoId = parseInt(req.params.produtoId);
      const fornecedorId = parseInt(req.params.fornecedorId);

      const index = db.associacoes.findIndex(
        a => a.produto_id === produtoId && a.fornecedor_id === fornecedorId
      );
      if (index === -1) {
        return res.status(404).json({ error: 'Associacao nao encontrada.' });
      }

      db.associacoes.splice(index, 1);
      res.json({ message: 'Fornecedor desassociado com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao desassociar fornecedor.' });
    }
  });

  return router;
};
