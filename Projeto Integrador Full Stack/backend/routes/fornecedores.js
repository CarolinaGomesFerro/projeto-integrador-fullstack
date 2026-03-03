const express = require('express');

module.exports = function(db) {
  const router = express.Router();

  // GET all fornecedores
  router.get('/', (req, res) => {
    try {
      const fornecedores = db.prepare('SELECT * FROM fornecedores ORDER BY created_at DESC').all();
      res.json(fornecedores);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar fornecedores.' });
    }
  });

  // GET single fornecedor
  router.get('/:id', (req, res) => {
    try {
      const fornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.id);
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
      }
      res.json(fornecedor);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar fornecedor.' });
    }
  });

  // POST create fornecedor
  router.post('/', (req, res) => {
    try {
      const { nome_empresa, cnpj, endereco, telefone, email, contato_principal } = req.body;

      // Validation
      const errors = {};
      if (!nome_empresa || nome_empresa.trim() === '') errors.nome_empresa = 'Nome da empresa é obrigatório.';
      if (!cnpj || cnpj.trim() === '') errors.cnpj = 'CNPJ é obrigatório.';
      if (!endereco || endereco.trim() === '') errors.endereco = 'Endereço é obrigatório.';
      if (!telefone || telefone.trim() === '') errors.telefone = 'Telefone é obrigatório.';
      if (!email || email.trim() === '') errors.email = 'E-mail é obrigatório.';
      if (!contato_principal || contato_principal.trim() === '') errors.contato_principal = 'Contato principal é obrigatório.';

      // Email validation
      if (email && email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          errors.email = 'E-mail inválido.';
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      // Clean CNPJ for storage (keep only digits)
      const cnpjClean = cnpj.replace(/\D/g, '');

      if (cnpjClean.length !== 14) {
        return res.status(400).json({ errors: { cnpj: 'CNPJ deve ter 14 dígitos.' } });
      }

      // Check unique CNPJ
      const existing = db.prepare('SELECT id FROM fornecedores WHERE cnpj = ?').get(cnpjClean);
      if (existing) {
        return res.status(409).json({ error: 'Fornecedor com esse CNPJ já está cadastrado!' });
      }

      const stmt = db.prepare(`
        INSERT INTO fornecedores (nome_empresa, cnpj, endereco, telefone, email, contato_principal)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        nome_empresa.trim(),
        cnpjClean,
        endereco.trim(),
        telefone.trim(),
        email.trim(),
        contato_principal.trim()
      );

      const fornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json({ message: 'Fornecedor cadastrado com sucesso!', fornecedor });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao cadastrar fornecedor.' });
    }
  });

  // PUT update fornecedor
  router.put('/:id', (req, res) => {
    try {
      const { nome_empresa, cnpj, endereco, telefone, email, contato_principal } = req.body;
      const { id } = req.params;

      const existing = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
      }

      // Validation
      const errors = {};
      if (!nome_empresa || nome_empresa.trim() === '') errors.nome_empresa = 'Nome da empresa é obrigatório.';
      if (!cnpj || cnpj.trim() === '') errors.cnpj = 'CNPJ é obrigatório.';
      if (!endereco || endereco.trim() === '') errors.endereco = 'Endereço é obrigatório.';
      if (!telefone || telefone.trim() === '') errors.telefone = 'Telefone é obrigatório.';
      if (!email || email.trim() === '') errors.email = 'E-mail é obrigatório.';
      if (!contato_principal || contato_principal.trim() === '') errors.contato_principal = 'Contato principal é obrigatório.';

      if (email && email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          errors.email = 'E-mail inválido.';
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      const cnpjClean = cnpj.replace(/\D/g, '');

      if (cnpjClean.length !== 14) {
        return res.status(400).json({ errors: { cnpj: 'CNPJ deve ter 14 dígitos.' } });
      }

      // Check unique CNPJ (excluding current)
      const duplicate = db.prepare('SELECT id FROM fornecedores WHERE cnpj = ? AND id != ?').get(cnpjClean, id);
      if (duplicate) {
        return res.status(409).json({ error: 'Fornecedor com esse CNPJ já está cadastrado!' });
      }

      const stmt = db.prepare(`
        UPDATE fornecedores SET nome_empresa = ?, cnpj = ?, endereco = ?, telefone = ?, email = ?, contato_principal = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(
        nome_empresa.trim(),
        cnpjClean,
        endereco.trim(),
        telefone.trim(),
        email.trim(),
        contato_principal.trim(),
        id
      );

      const fornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(id);
      res.json({ message: 'Fornecedor atualizado com sucesso!', fornecedor });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar fornecedor.' });
    }
  });

  // DELETE fornecedor
  router.delete('/:id', (req, res) => {
    try {
      const existing = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
      }

      db.prepare('DELETE FROM fornecedores WHERE id = ?').run(req.params.id);
      res.json({ message: 'Fornecedor excluído com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir fornecedor.' });
    }
  });

  return router;
};
