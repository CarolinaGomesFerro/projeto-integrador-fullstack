import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { getProdutos, createProduto, updateProduto, deleteProduto, getImageUrl } from '../services/api';
import type { Produto } from '../services/api';
import Toast from '../components/Toast';

const CATEGORIAS = ['Eletrônicos', 'Alimentos', 'Vestuário', 'Limpeza', 'Higiene', 'Papelaria', 'Ferramentas', 'Outro'];

interface ProdutoForm {
  nome: string;
  codigo_barras: string;
  descricao: string;
  preco: string;
  quantidade_estoque: string;
  categoria: string;
  data_validade: string;
}

const emptyForm: ProdutoForm = {
  nome: '',
  codigo_barras: '',
  descricao: '',
  preco: '',
  quantidade_estoque: '',
  categoria: '',
  data_validade: '',
};

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProdutoForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProdutos = useCallback(async () => {
    try {
      const data = await getProdutos();
      setProdutos(data);
    } catch {
      setToast({ message: 'Erro ao carregar produtos.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProdutos();
  }, [loadProdutos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData();
    formData.append('nome', form.nome);
    formData.append('codigo_barras', form.codigo_barras);
    formData.append('descricao', form.descricao);
    formData.append('preco', form.preco);
    formData.append('quantidade_estoque', form.quantidade_estoque);
    formData.append('categoria', form.categoria);
    formData.append('data_validade', form.data_validade);
    if (imageFile) {
      formData.append('imagem', imageFile);
    }

    try {
      const result = editingId
        ? await updateProduto(editingId, formData)
        : await createProduto(formData);

      if (result.errors) {
        setErrors(result.errors);
        return;
      }
      if (result.error) {
        setToast({ message: result.error, type: 'error' });
        return;
      }

      setToast({ message: result.message, type: 'success' });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setImageFile(null);
      loadProdutos();
    } catch {
      setToast({ message: 'Erro ao salvar produto.', type: 'error' });
    }
  };

  const handleEdit = (produto: Produto) => {
    setForm({
      nome: produto.nome,
      codigo_barras: produto.codigo_barras || '',
      descricao: produto.descricao,
      preco: produto.preco?.toString() || '',
      quantidade_estoque: produto.quantidade_estoque.toString(),
      categoria: produto.categoria,
      data_validade: produto.data_validade || '',
    });
    setEditingId(produto.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const result = await deleteProduto(id);
      setToast({ message: result.message, type: 'success' });
      loadProdutos();
    } catch {
      setToast({ message: 'Erro ao excluir produto.', type: 'error' });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setErrors({});
  };

  const filteredProdutos = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.codigo_barras && p.codigo_barras.includes(search)) ||
      p.categoria.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Cadastro de Produto</h1>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setErrors({}); }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Novo Produto</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              {editingId ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Insira o nome do produto"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                <input
                  type="text"
                  placeholder="Insira o código de barras"
                  value={form.codigo_barras}
                  onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.codigo_barras ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.codigo_barras && <p className="text-red-500 text-xs mt-1">{errors.codigo_barras}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Descreva brevemente o produto"
                  rows={3}
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.descricao ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.descricao && <p className="text-red-500 text-xs mt-1">{errors.descricao}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade em Estoque</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Quantidade disponível"
                  value={form.quantidade_estoque}
                  onChange={(e) => setForm({ ...form, quantidade_estoque: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.categoria ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Selecione uma categoria</option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade</label>
                <input
                  type="date"
                  value={form.data_validade}
                  onChange={(e) => setForm({ ...form, data_validade: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Produto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {editingId ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, código de barras ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : filteredProdutos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado. Clique em "Novo Produto" para começar.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Imagem</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Código de Barras</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Categoria</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Preço</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estoque</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProdutos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {produto.imagem ? (
                        <img
                          src={getImageUrl(produto.imagem)}
                          alt={produto.nome}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{produto.nome}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{produto.descricao}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{produto.codigo_barras || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {produto.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(produto.preco)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{produto.quantidade_estoque}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(produto)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(produto.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Need this for the table image placeholder
import { Package } from 'lucide-react';
