const express = require('express');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens são permitidas!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = function(db) {
  const router = express.Router();

  // GET all products
  router.get('/', (req, res) => {
    try {
      const produtos = db.prepare('SELECT * FROM produtos ORDER BY created_at DESC').all();
      res.json(produtos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
  });

  // GET single product
  router.get('/:id', (req, res) => {
    try {
      const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }
      res.json(produto);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar produto.' });
    }
  });

  // POST create product
  router.post('/', upload.single('imagem'), (req, res) => {
    try {
      const { nome, codigo_barras, descricao, preco, quantidade_estoque, categoria, data_validade } = req.body;

      // Validation
      const errors = {};
      if (!nome || nome.trim() === '') errors.nome = 'Nome do produto é obrigatório.';
      if (!descricao || descricao.trim() === '') errors.descricao = 'Descrição é obrigatória.';
      if (!categoria || categoria.trim() === '') errors.categoria = 'Categoria é obrigatória.';

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      // Check unique barcode
      if (codigo_barras && codigo_barras.trim() !== '') {
        const existing = db.prepare('SELECT id FROM produtos WHERE codigo_barras = ?').get(codigo_barras.trim());
        if (existing) {
          return res.status(409).json({ error: 'Produto com este código de barras já está cadastrado!' });
        }
      }

      const imagem = req.file ? req.file.filename : null;

      const stmt = db.prepare(`
        INSERT INTO produtos (nome, codigo_barras, descricao, preco, quantidade_estoque, categoria, data_validade, imagem)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        nome.trim(),
        codigo_barras ? codigo_barras.trim() : null,
        descricao.trim(),
        preco ? parseFloat(preco) : null,
        quantidade_estoque ? parseInt(quantidade_estoque) : 0,
        categoria.trim(),
        data_validade || null,
        imagem
      );

      const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json({ message: 'Produto cadastrado com sucesso!', produto });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao cadastrar produto.' });
    }
  });

  // PUT update product
  router.put('/:id', upload.single('imagem'), (req, res) => {
    try {
      const { nome, codigo_barras, descricao, preco, quantidade_estoque, categoria, data_validade } = req.body;
      const { id } = req.params;

      const existing = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      // Validation
      const errors = {};
      if (!nome || nome.trim() === '') errors.nome = 'Nome do produto é obrigatório.';
      if (!descricao || descricao.trim() === '') errors.descricao = 'Descrição é obrigatória.';
      if (!categoria || categoria.trim() === '') errors.categoria = 'Categoria é obrigatória.';

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      // Check unique barcode (excluding current product)
      if (codigo_barras && codigo_barras.trim() !== '') {
        const duplicate = db.prepare('SELECT id FROM produtos WHERE codigo_barras = ? AND id != ?').get(codigo_barras.trim(), id);
        if (duplicate) {
          return res.status(409).json({ error: 'Produto com este código de barras já está cadastrado!' });
        }
      }

      const imagem = req.file ? req.file.filename : existing.imagem;

      const stmt = db.prepare(`
        UPDATE produtos SET nome = ?, codigo_barras = ?, descricao = ?, preco = ?, quantidade_estoque = ?, categoria = ?, data_validade = ?, imagem = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(
        nome.trim(),
        codigo_barras ? codigo_barras.trim() : null,
        descricao.trim(),
        preco ? parseFloat(preco) : null,
        quantidade_estoque ? parseInt(quantidade_estoque) : 0,
        categoria.trim(),
        data_validade || null,
        imagem,
        id
      );

      const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
      res.json({ message: 'Produto atualizado com sucesso!', produto });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
  });

  // DELETE product
  router.delete('/:id', (req, res) => {
    try {
      const existing = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      db.prepare('DELETE FROM produtos WHERE id = ?').run(req.params.id);
      res.json({ message: 'Produto excluído com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir produto.' });
    }
  });

  return router;
};
