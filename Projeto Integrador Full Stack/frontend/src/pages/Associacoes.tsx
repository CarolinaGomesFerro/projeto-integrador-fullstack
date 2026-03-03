import { useState, useEffect, useCallback } from 'react';
import { LinkIcon, Unlink, Search } from 'lucide-react';
import { getProdutos, getFornecedores, getFornecedoresByProduto, associarFornecedor, desassociarFornecedor } from '../services/api';
import type { Produto, Fornecedor, FornecedorAssociado } from '../services/api';
import Toast from '../components/Toast';

function displayCnpj(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }
  return cnpj;
}

export default function Associacoes() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [selectedProdutoId, setSelectedProdutoId] = useState<number | null>(null);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [fornecedoresAssociados, setFornecedoresAssociados] = useState<FornecedorAssociado[]>([]);
  const [selectedFornecedorId, setSelectedFornecedorId] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchProduto, setSearchProduto] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [prodData, fornData] = await Promise.all([getProdutos(), getFornecedores()]);
      setProdutos(prodData);
      setFornecedores(fornData);
    } catch {
      setToast({ message: 'Erro ao carregar dados.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadAssociacoes = useCallback(async (produtoId: number) => {
    try {
      const data = await getFornecedoresByProduto(produtoId);
      setSelectedProduto(data.produto);
      setFornecedoresAssociados(data.fornecedores);
    } catch {
      setToast({ message: 'Erro ao carregar associações.', type: 'error' });
    }
  }, []);

  useEffect(() => {
    if (selectedProdutoId) {
      loadAssociacoes(selectedProdutoId);
    }
  }, [selectedProdutoId, loadAssociacoes]);

  const handleSelectProduto = (produtoId: number) => {
    setSelectedProdutoId(produtoId);
    setSelectedFornecedorId('');
  };

  const handleAssociar = async () => {
    if (!selectedProdutoId || !selectedFornecedorId) {
      setToast({ message: 'Selecione um produto e um fornecedor.', type: 'error' });
      return;
    }

    try {
      const result = await associarFornecedor(selectedProdutoId, parseInt(selectedFornecedorId));
      if (result.error) {
        setToast({ message: result.error, type: 'error' });
        return;
      }
      setToast({ message: result.message, type: 'success' });
      setSelectedFornecedorId('');
      loadAssociacoes(selectedProdutoId);
    } catch {
      setToast({ message: 'Erro ao associar fornecedor.', type: 'error' });
    }
  };

  const handleDesassociar = async (associacaoId: number) => {
    if (!confirm('Deseja desassociar este fornecedor do produto?')) return;
    try {
      const result = await desassociarFornecedor(associacaoId);
      setToast({ message: result.message, type: 'success' });
      if (selectedProdutoId) {
        loadAssociacoes(selectedProdutoId);
      }
    } catch {
      setToast({ message: 'Erro ao desassociar fornecedor.', type: 'error' });
    }
  };

  const filteredProdutos = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchProduto.toLowerCase()) ||
      (p.codigo_barras && p.codigo_barras.includes(searchProduto))
  );

  // Filter out already associated fornecedores from dropdown
  const availableFornecedores = fornecedores.filter(
    (f) => !fornecedoresAssociados.some((fa) => fa.id === f.id)
  );

  if (loading) {
    return <div className="text-center text-gray-500 py-8">Carregando...</div>;
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Associação de Fornecedor a Produto</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product selection panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Selecione um Produto</h2>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchProduto}
                onChange={(e) => setSearchProduto(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {filteredProdutos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {produtos.length === 0 ? 'Nenhum produto cadastrado.' : 'Nenhum produto encontrado.'}
              </p>
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredProdutos.map((produto) => (
                  <button
                    key={produto.id}
                    onClick={() => handleSelectProduto(produto.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedProdutoId === produto.id
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{produto.nome}</div>
                    {produto.codigo_barras && (
                      <div className="text-xs text-gray-500">{produto.codigo_barras}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Association details panel */}
        <div className="lg:col-span-2">
          {!selectedProduto ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
              <LinkIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Selecione um produto à esquerda para gerenciar suas associações com fornecedores.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Product details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Detalhes do Produto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Nome do Produto</label>
                    <p className="text-sm text-gray-800 font-medium">{selectedProduto.nome}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Código de Barras</label>
                    <p className="text-sm text-gray-800">{selectedProduto.codigo_barras || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase">Descrição</label>
                    <p className="text-sm text-gray-800">{selectedProduto.descricao}</p>
                  </div>
                </div>
              </div>

              {/* Associate fornecedor */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Associar Fornecedor</h2>
                {fornecedores.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum fornecedor cadastrado. Cadastre fornecedores primeiro.</p>
                ) : (
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Selecione um Fornecedor</label>
                      <select
                        value={selectedFornecedorId}
                        onChange={(e) => setSelectedFornecedorId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione um fornecedor</option>
                        {availableFornecedores.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.nome_empresa} - {displayCnpj(f.cnpj)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleAssociar}
                      disabled={!selectedFornecedorId}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>Associar Fornecedor</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Associated fornecedores list */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Fornecedores Associados ({fornecedoresAssociados.length})
                  </h2>
                </div>
                {fornecedoresAssociados.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Nenhum fornecedor associado a este produto.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nome do Fornecedor</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">CNPJ</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contato</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {fornecedoresAssociados.map((f) => (
                          <tr key={f.associacao_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{f.nome_empresa}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 font-mono">{displayCnpj(f.cnpj)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{f.contato_principal}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDesassociar(f.associacao_id)}
                                className="inline-flex items-center space-x-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm transition-colors"
                              >
                                <Unlink className="h-4 w-4" />
                                <span>Desassociar</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
