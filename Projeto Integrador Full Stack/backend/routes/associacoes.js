const express = require('express');

module.exports = function(db) {
  const router = express.Router();

  // GET all associations
  router.get('/', (req, res) => {
    try {
      const associacoes = db.prepare(`
        SELECT pf.id, pf.produto_id, pf.fornecedor_id, pf.created_at,
               p.nome as produto_nome, p.codigo_barras,
               f.nome_empresa as fornecedor_nome, f.cnpj
        FROM produto_fornecedor pf
        JOIN produtos p ON pf.produto_id = p.id
        JOIN fornecedores f ON pf.fornecedor_id = f.id
        ORDER BY pf.created_at DESC
      `).all();
      res.json(associacoes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar associações.' });
    }
  });

  // GET fornecedores by produto
  router.get('/produto/:produtoId', (req, res) => {
    try {
      const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.produtoId);
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      const fornecedores = db.prepare(`
        SELECT f.*, pf.id as associacao_id
        FROM fornecedores f
        JOIN produto_fornecedor pf ON f.id = pf.fornecedor_id
        WHERE pf.produto_id = ?
        ORDER BY f.nome_empresa
      `).all(req.params.produtoId);

      res.json({ produto, fornecedores });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar fornecedores do produto.' });
    }
  });

  // GET produtos by fornecedor
  router.get('/fornecedor/:fornecedorId', (req, res) => {
    try {
      const fornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.fornecedorId);
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
      }

      const produtos = db.prepare(`
        SELECT p.*, pf.id as associacao_id
        FROM produtos p
        JOIN produto_fornecedor pf ON p.id = pf.produto_id
        WHERE pf.fornecedor_id = ?
        ORDER BY p.nome
      `).all(req.params.fornecedorId);

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
        return res.status(400).json({ error: 'Produto e fornecedor são obrigatórios.' });
      }

      // Check if produto exists
      const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(produto_id);
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      // Check if fornecedor exists
      const fornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(fornecedor_id);
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
      }

      // Check if association already exists
      const existing = db.prepare(
        'SELECT id FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?'
      ).get(produto_id, fornecedor_id);

      if (existing) {
        return res.status(409).json({ error: 'Fornecedor já está associado a este produto!' });
      }

      const stmt = db.prepare('INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)');
      const result = stmt.run(produto_id, fornecedor_id);

      res.status(201).json({
        message: 'Fornecedor associado com sucesso ao produto!',
        associacao: {
          id: result.lastInsertRowid,
          produto_id,
          fornecedor_id,
          produto_nome: produto.nome,
          fornecedor_nome: fornecedor.nome_empresa
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao associar fornecedor ao produto.' });
    }
  });

  // DELETE disassociate fornecedor from produto
  router.delete('/:id', (req, res) => {
    try {
      const existing = db.prepare('SELECT * FROM produto_fornecedor WHERE id = ?').get(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Associação não encontrada.' });
      }

      db.prepare('DELETE FROM produto_fornecedor WHERE id = ?').run(req.params.id);
      res.json({ message: 'Fornecedor desassociado com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao desassociar fornecedor.' });
    }
  });

  // DELETE by produto_id and fornecedor_id
  router.delete('/produto/:produtoId/fornecedor/:fornecedorId', (req, res) => {
    try {
      const { produtoId, fornecedorId } = req.params;
      const existing = db.prepare(
        'SELECT * FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?'
      ).get(produtoId, fornecedorId);

      if (!existing) {
        return res.status(404).json({ error: 'Associação não encontrada.' });
      }

      db.prepare('DELETE FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?').run(produtoId, fornecedorId);
      res.json({ message: 'Fornecedor desassociado com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao desassociar fornecedor.' });
    }
  });

  return router;
};
