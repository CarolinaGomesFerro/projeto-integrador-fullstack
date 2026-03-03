import { Link, useLocation } from 'react-router-dom';
import { Package, Truck, LinkIcon } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { path: '/produtos', label: 'Produtos', icon: Package },
    { path: '/fornecedores', label: 'Fornecedores', icon: Truck },
    { path: '/associacoes', label: 'Associações', icon: LinkIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-white" />
              <span className="text-white font-bold text-xl">Sistema de Estoque</span>
            </Link>
            <div className="flex space-x-1 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-800 text-white'
                        : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
