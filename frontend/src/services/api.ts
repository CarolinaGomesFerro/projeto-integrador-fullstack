const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Produto types
export interface Produto {
  id: number;
  nome: string;
  codigo_barras: string | null;
  descricao: string;
  preco: number | null;
  quantidade_estoque: number;
  categoria: string;
  data_validade: string | null;
  imagem: string | null;
  created_at: string;
  updated_at: string;
}

// Fornecedor types
export interface Fornecedor {
  id: number;
  nome_empresa: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  contato_principal: string;
  created_at: string;
  updated_at: string;
}

export interface FornecedorAssociado extends Fornecedor {
  associacao_id: number;
}

// API error type
export interface ApiError {
  error?: string;
  errors?: Record<string, string>;
}

// ==================== PRODUTOS ====================

export async function getProdutos(): Promise<Produto[]> {
  const res = await fetch(`${API_URL}/api/produtos`);
  return res.json();
}

export async function getProduto(id: number): Promise<Produto> {
  const res = await fetch(`${API_URL}/api/produtos/${id}`);
  return res.json();
}

export async function createProduto(data: FormData): Promise<{ message: string; produto: Produto } & ApiError> {
  const res = await fetch(`${API_URL}/api/produtos`, {
    method: 'POST',
    body: data,
  });
  return res.json();
}

export async function updateProduto(id: number, data: FormData): Promise<{ message: string; produto: Produto } & ApiError> {
  const res = await fetch(`${API_URL}/api/produtos/${id}`, {
    method: 'PUT',
    body: data,
  });
  return res.json();
}

export async function deleteProduto(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/produtos/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

// ==================== FORNECEDORES ====================

export async function getFornecedores(): Promise<Fornecedor[]> {
  const res = await fetch(`${API_URL}/api/fornecedores`);
  return res.json();
}

export async function getFornecedor(id: number): Promise<Fornecedor> {
  const res = await fetch(`${API_URL}/api/fornecedores/${id}`);
  return res.json();
}

export async function createFornecedor(data: Partial<Fornecedor>): Promise<{ message: string; fornecedor: Fornecedor } & ApiError> {
  const res = await fetch(`${API_URL}/api/fornecedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateFornecedor(id: number, data: Partial<Fornecedor>): Promise<{ message: string; fornecedor: Fornecedor } & ApiError> {
  const res = await fetch(`${API_URL}/api/fornecedores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteFornecedor(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/fornecedores/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

// ==================== ASSOCIACOES ====================

export async function getFornecedoresByProduto(produtoId: number): Promise<{ produto: Produto; fornecedores: FornecedorAssociado[] }> {
  const res = await fetch(`${API_URL}/api/associacoes/produto/${produtoId}`);
  return res.json();
}

export async function associarFornecedor(produtoId: number, fornecedorId: number): Promise<{ message: string } & ApiError> {
  const res = await fetch(`${API_URL}/api/associacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produto_id: produtoId, fornecedor_id: fornecedorId }),
  });
  return res.json();
}

export async function desassociarFornecedor(associacaoId: number): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/associacoes/${associacaoId}`, {
    method: 'DELETE',
  });
  return res.json();
}

export function getImageUrl(filename: string): string {
  return `${API_URL}/uploads/${filename}`;
}
