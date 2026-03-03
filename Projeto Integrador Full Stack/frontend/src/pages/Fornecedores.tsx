import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { getFornecedores, createFornecedor, updateFornecedor, deleteFornecedor } from '../services/api';
import type { Fornecedor } from '../services/api';
import Toast from '../components/Toast';

interface FornecedorForm {
  nome_empresa: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  contato_principal: string;
}

const emptyForm: FornecedorForm = {
  nome_empresa: '',
  cnpj: '',
  endereco: '',
  telefone: '',
  email: '',
  contato_principal: '',
};

// Format CNPJ: 00.000.000/0000-00
function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

// Format phone: (00) 0000-0000 or (00) 00000-0000
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function displayCnpj(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }
  return cnpj;
}

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FornecedorForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFornecedores = useCallback(async () => {
    try {
      const data = await getFornecedores();
      setFornecedores(data);
    } catch {
      setToast({ message: 'Erro ao carregar fornecedores.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFornecedores();
  }, [loadFornecedores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const result = editingId
        ? await updateFornecedor(editingId, form)
        : await createFornecedor(form);

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
      loadFornecedores();
    } catch {
      setToast({ message: 'Erro ao salvar fornecedor.', type: 'error' });
    }
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setForm({
      nome_empresa: fornecedor.nome_empresa,
      cnpj: formatCnpj(fornecedor.cnpj),
      endereco: fornecedor.endereco,
      telefone: fornecedor.telefone,
      email: fornecedor.email,
      contato_principal: fornecedor.contato_principal,
    });
    setEditingId(fornecedor.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    try {
      const result = await deleteFornecedor(id);
      setToast({ message: result.message, type: 'success' });
      loadFornecedores();
    } catch {
      setToast({ message: 'Erro ao excluir fornecedor.', type: 'error' });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const filteredFornecedores = fornecedores.filter(
    (f) =>
      f.nome_empresa.toLowerCase().includes(search.toLowerCase()) ||
      f.cnpj.includes(search.replace(/\D/g, '')) ||
      f.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Cadastro de Fornecedor</h1>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setErrors({}); }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Novo Fornecedor</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              {editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </h2>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Insira o nome da empresa"
                  value={form.nome_empresa}
                  onChange={(e) => setForm({ ...form, nome_empresa: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nome_empresa ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nome_empresa && <p className="text-red-500 text-xs mt-1">{errors.nome_empresa}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: formatCnpj(e.target.value) })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cnpj ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Insira o endereço completo da empresa"
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endereco ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.endereco && <p className="text-red-500 text-xs mt-1">{errors.endereco}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="(00) 0000-0000"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: formatPhone(e.target.value) })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.telefone ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="exemplo@fornecedor.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contato Principal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nome do contato principal"
                  value={form.contato_principal}
                  onChange={(e) => setForm({ ...form, contato_principal: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contato_principal ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.contato_principal && <p className="text-red-500 text-xs mt-1">{errors.contato_principal}</p>}
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
          placeholder="Buscar por nome, CNPJ ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Fornecedores table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : filteredFornecedores.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search ? 'Nenhum fornecedor encontrado.' : 'Nenhum fornecedor cadastrado. Clique em "Novo Fornecedor" para começar.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Empresa</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">CNPJ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Telefone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">E-mail</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contato</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFornecedores.map((fornecedor) => (
                  <tr key={fornecedor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{fornecedor.nome_empresa}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{fornecedor.endereco}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{displayCnpj(fornecedor.cnpj)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{fornecedor.telefone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{fornecedor.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{fornecedor.contato_principal}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(fornecedor)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fornecedor.id)}
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
