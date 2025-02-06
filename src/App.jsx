import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Budgets from './components/Budgets';
import Customers from './components/Customers';
import Login from './components/Login';
import Products from './components/Products';
import Reports from './components/Reports';

function App() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  return (
    <div className="App">
      <header>
        <h1>PersiFIX</h1>
        <div className="auth-info">
          <span>Usuário: Admin</span>
          <button>Logout</button>
        </div>
      </header>
      <nav>
        <ul>
          <li><a href="/">Orçamentos</a></li>
          <li><a href="/produtos">Produtos</a></li>
          <li><a href="/clientes">Clientes</a></li>
          <li><a href="/relatorios">Relatórios</a></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Budgets customers={customers} products={products} />} />
        <Route path="/produtos" element={<Products products={products} setProducts={setProducts} />} />
        <Route path="/clientes" element={<Customers customers={customers} setCustomers={setCustomers} />} />
        <Route path="/relatorios" element={<Reports />} />
      </Routes>
    </div>
  );
}

export default App;
