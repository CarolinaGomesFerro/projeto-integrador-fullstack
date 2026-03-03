import { Link } from 'react-router-dom';
import { Package, Truck, LinkIcon } from 'lucide-react';

export default function Home() {
  const cards = [
    {
      title: 'Produtos',
      description: 'Cadastre, edite e gerencie os produtos do seu estoque.',
      icon: Package,
      path: '/produtos',
      color: 'bg-blue-500',
    },
    {
      title: 'Fornecedores',
      description: 'Cadastre e gerencie os fornecedores da sua empresa.',
      icon: Truck,
      path: '/fornecedores',
      color: 'bg-green-500',
    },
    {
      title: 'Associações',
      description: 'Associe fornecedores aos produtos para rastrear compras.',
      icon: LinkIcon,
      path: '/associacoes',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="text-center">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Sistema de Controle de Estoque</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Gerencie seus produtos, fornecedores e suas associações de forma simples e eficiente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.path}
              to={card.path}
              className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 text-left"
            >
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h2>
              <p className="text-sm text-gray-600">{card.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 text-sm text-gray-400">
        <p>Projeto Integrador - Faculdade Gran</p>
      </div>
    </div>
  );
}
