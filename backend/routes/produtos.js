const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
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
    cb(new Error('Apenas imagens sao permitidas!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

function getNow() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

module.exports = function(db) {
  const router = express.Router();

  // GET all products
  router.get('/', (req, res) => {
    try {
      const sorted = [...db.produtos].sort((a, b) => b.id - a.id);
      res.json(sorted);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
  });

  // GET single product
  router.get('/:id', (req, res) => {
    try {
      const produto = db.produtos.find(p => p.id === parseInt(req.params.id));
      if (!produto) {
        return res.status(404).json({ error: 'Produto nao encontrado.' });
      }
      res.json(produto);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar produto.' });
    }
  });

  // POST create product (accepts both JSON and multipart/form-data)
  router.post('/', upload.single('imagem'), (req, res) => {
    try {
      const { nome, codigo_barras, descricao, preco, quantidade_estoque, categoria, data_validade } = req.body;

      // Validation
      const errors = {};
      if (!nome || nome.trim() === '') errors.nome = 'Nome do produto e obrigatorio.';
      if (!descricao || descricao.trim() === '') errors.descricao = 'Descricao e obrigatoria.';
      if (!categoria || categoria.trim() === '') errors.categoria = 'Categoria e obrigatoria.';

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      // Check unique barcode
      if (codigo_barras && codigo_barras.trim() !== '') {
        const existing = db.produtos.find(p => p.codigo_barras === codigo_barras.trim());
        if (existing) {
          return res.status(409).json({ error: 'Produto com este codigo de barras ja esta cadastrado!' });
        }
      }

      const imagem = req.file ? req.file.filename : null;
      const now = getNow();

      const produto = {
        id: db.nextProdutoId++,
        nome: nome.trim(),
        codigo_barras: codigo_barras ? codigo_barras.trim() : null,
        descricao: descricao.trim(),
        preco: preco ? parseFloat(preco) : null,
        quantidade_estoque: quantidade_estoque ? parseInt(quantidade_estoque) : 0,
        categoria: categoria.trim(),
        data_validade: data_validade || null,
        imagem,
        created_at: now,
        updated_at: now,
      };

      db.produtos.push(produto);
      res.status(201).json({ message: 'Produto cadastrado com sucesso!', produto });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao cadastrar produto.' });
    }
  });

  // PUT update product
  router.put('/:id', upload.single('imagem'), (req, res) => {
    try {
      const { nome, codigo_barras, descricao, preco, quantidade_estoque, categoria, data_validade } = req.body;
      const id = parseInt(req.params.id);

      const index = db.produtos.findIndex(p => p.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Produto nao encontrado.' });
      }

      // Validation
      const errors = {};
      if (!nome || nome.trim() === '') errors.nome = 'Nome do produto e obrigatorio.';
      if (!descricao || descricao.trim() === '') errors.descricao = 'Descricao e obrigatoria.';
      if (!categoria || categoria.trim() === '') errors.categoria = 'Categoria e obrigatoria.';

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      // Check unique barcode (excluding current product)
      if (codigo_barras && codigo_barras.trim() !== '') {
        const duplicate = db.produtos.find(p => p.codigo_barras === codigo_barras.trim() && p.id !== id);
        if (duplicate) {
          return res.status(409).json({ error: 'Produto com este codigo de barras ja esta cadastrado!' });
        }
      }

      const imagem = req.file ? req.file.filename : db.produtos[index].imagem;

      db.produtos[index] = {
        ...db.produtos[index],
        nome: nome.trim(),
        codigo_barras: codigo_barras ? codigo_barras.trim() : null,
        descricao: descricao.trim(),
        preco: preco ? parseFloat(preco) : null,
        quantidade_estoque: quantidade_estoque ? parseInt(quantidade_estoque) : 0,
        categoria: categoria.trim(),
        data_validade: data_validade || null,
        imagem,
        updated_at: getNow(),
      };

      res.json({ message: 'Produto atualizado com sucesso!', produto: db.produtos[index] });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
  });

  // DELETE product
  router.delete('/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const index = db.produtos.findIndex(p => p.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Produto nao encontrado.' });
      }

      db.produtos.splice(index, 1);
      // Also remove associations
      db.associacoes = db.associacoes.filter(a => a.produto_id !== id);
      res.json({ message: 'Produto excluido com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir produto.' });
    }
  });

  return router;
};
