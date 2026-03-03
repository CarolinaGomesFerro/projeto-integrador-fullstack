const express = require('express');

function getNow() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

module.exports = function(db) {
  const router = express.Router();

  // GET all fornecedores
  router.get('/', (req, res) => {
    try {
      const sorted = [...db.fornecedores].sort((a, b) => b.id - a.id);
      res.json(sorted);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar fornecedores.' });
    }
  });

  // GET single fornecedor
  router.get('/:id', (req, res) => {
    try {
      const fornecedor = db.fornecedores.find(f => f.id === parseInt(req.params.id));
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor nao encontrado.' });
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
      if (!nome_empresa || nome_empresa.trim() === '') errors.nome_empresa = 'Nome da empresa e obrigatorio.';
      if (!cnpj || cnpj.trim() === '') errors.cnpj = 'CNPJ e obrigatorio.';
      if (!endereco || endereco.trim() === '') errors.endereco = 'Endereco e obrigatorio.';
      if (!telefone || telefone.trim() === '') errors.telefone = 'Telefone e obrigatorio.';
      if (!email || email.trim() === '') errors.email = 'E-mail e obrigatorio.';
      if (!contato_principal || contato_principal.trim() === '') errors.contato_principal = 'Contato principal e obrigatorio.';

      // Email validation
      if (email && email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          errors.email = 'E-mail invalido.';
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      // Clean CNPJ for storage (keep only digits)
      const cnpjClean = cnpj.replace(/\D/g, '');

      if (cnpjClean.length !== 14) {
        return res.status(400).json({ errors: { cnpj: 'CNPJ deve ter 14 digitos.' } });
      }

      // Check unique CNPJ
      const existing = db.fornecedores.find(f => f.cnpj === cnpjClean);
      if (existing) {
        return res.status(409).json({ error: 'Fornecedor com esse CNPJ ja esta cadastrado!' });
      }

      const now = getNow();
      const fornecedor = {
        id: db.nextFornecedorId++,
        nome_empresa: nome_empresa.trim(),
        cnpj: cnpjClean,
        endereco: endereco.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        contato_principal: contato_principal.trim(),
        created_at: now,
        updated_at: now,
      };

      db.fornecedores.push(fornecedor);
      res.status(201).json({ message: 'Fornecedor cadastrado com sucesso!', fornecedor });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao cadastrar fornecedor.' });
    }
  });

  // PUT update fornecedor
  router.put('/:id', (req, res) => {
    try {
      const { nome_empresa, cnpj, endereco, telefone, email, contato_principal } = req.body;
      const id = parseInt(req.params.id);

      const index = db.fornecedores.findIndex(f => f.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Fornecedor nao encontrado.' });
      }

      // Validation
      const errors = {};
      if (!nome_empresa || nome_empresa.trim() === '') errors.nome_empresa = 'Nome da empresa e obrigatorio.';
      if (!cnpj || cnpj.trim() === '') errors.cnpj = 'CNPJ e obrigatorio.';
      if (!endereco || endereco.trim() === '') errors.endereco = 'Endereco e obrigatorio.';
      if (!telefone || telefone.trim() === '') errors.telefone = 'Telefone e obrigatorio.';
      if (!email || email.trim() === '') errors.email = 'E-mail e obrigatorio.';
      if (!contato_principal || contato_principal.trim() === '') errors.contato_principal = 'Contato principal e obrigatorio.';

      if (email && email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          errors.email = 'E-mail invalido.';
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      const cnpjClean = cnpj.replace(/\D/g, '');

      if (cnpjClean.length !== 14) {
        return res.status(400).json({ errors: { cnpj: 'CNPJ deve ter 14 digitos.' } });
      }

      // Check unique CNPJ (excluding current)
      const duplicate = db.fornecedores.find(f => f.cnpj === cnpjClean && f.id !== id);
      if (duplicate) {
        return res.status(409).json({ error: 'Fornecedor com esse CNPJ ja esta cadastrado!' });
      }

      db.fornecedores[index] = {
        ...db.fornecedores[index],
        nome_empresa: nome_empresa.trim(),
        cnpj: cnpjClean,
        endereco: endereco.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        contato_principal: contato_principal.trim(),
        updated_at: getNow(),
      };

      res.json({ message: 'Fornecedor atualizado com sucesso!', fornecedor: db.fornecedores[index] });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar fornecedor.' });
    }
  });

  // DELETE fornecedor
  router.delete('/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const index = db.fornecedores.findIndex(f => f.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Fornecedor nao encontrado.' });
      }

      db.fornecedores.splice(index, 1);
      // Also remove associations
      db.associacoes = db.associacoes.filter(a => a.fornecedor_id !== id);
      res.json({ message: 'Fornecedor excluido com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir fornecedor.' });
    }
  });

  return router;
};
