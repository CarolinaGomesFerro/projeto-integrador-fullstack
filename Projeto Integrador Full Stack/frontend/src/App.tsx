import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Produtos from './pages/Produtos';
import Fornecedores from './pages/Fornecedores';
import Associacoes from './pages/Associacoes';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/associacoes" element={<Associacoes />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
