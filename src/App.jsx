import React, { useState } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import './App.css';
import BudgetStatusPage from './components/BudgetStatusPage';
import Budgets from './components/Budgets';
import Customers from './components/Customers';
import Products from './components/Products';
import Accessories from './components/Accessories';
import Reports from './components/Reports';
import Login from './components/Login';
import Configuracoes from './components/Configuracoes';
import BudgetList from './components/BudgetList';
import BudgetDetailsPage from './components/BudgetDetailsPage'; // Import BudgetDetailsPage

function App() {
  const [companyLogo, setCompanyLogo] = useState(null);
  const [validadeOrcamento, setValidadeOrcamento] = useState('30');
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Cliente A', phone: '1234-5678', email: 'clientea@email.com', address: 'Rua X' },
    { id: 2, name: 'Cliente B', phone: '9876-5432', email: 'clienteb@email.com', address: 'Rua Y' },
  ]);
  const [products, setProducts] = useState([
    { id: 1, name: 'Produto 1', model: 'Modelo X', material: 'Ferro', code: 'PROD1', salePrice: 150.00, calculationMethod: 'unit' },
    { id: 2, name: 'Produto 2', model: 'Wave', material: 'Aluminio', code: 'PROD2', salePrice: 200.00, calculationMethod: 'm2' },
    { id: 3, name: 'Produto 3', model: 'Modelo Z', material: 'Aço', code: 'PROD3', salePrice: 300.00, calculationMethod: 'unit' },
  ]);
   const [accessories, setAccessories] = useState([
    { id: 1, name: 'Acessório 1', price: 25.00 },
    { id: 2, name: 'Acessório 2', price: 50.00 },
  ]);
  const [budgets, setBudgets] = useState([
    { id: 1, customerName: 'Cliente A', totalValue: 550.00, creationDate: new Date(), status: 'pendente', items: [
      { type: 'product', item: { name: 'Produto 1', model: 'Modelo X' }, length: 1, height: 1, price: 150.00 },
      { type: 'accessory', item: { name: 'Acessório 1' }, price: 25.00 }
    ] },
    { id: 2, customerName: 'Cliente B', totalValue: 320.00, creationDate: new Date(), status: 'finalizado', items: [
      { type: 'product', item: { name: 'Produto 2', model: 'Wave' }, length: 2, height: 0, price: 200.00 },
      { type: 'accessory', item: { name: 'Acessório 2' }, price: 50.00 }
    ] },
  ]);


  return (
      <div className="app">
        <header className="app-header">
          {companyLogo ? (
            <img src={URL.createObjectURL(companyLogo)} alt="Company Logo" style={{ maxHeight: '50px' }} />
          ) : (
            <h1>PersiFIX</h1>
          )}
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/customers">Clientes</Link></li>
              <li><Link to="/products">Produtos</Link></li>
              <li><Link to="/accessories">Acessórios</Link></li>
              <li><Link to="/budgets">Orçamentos</Link></li>
              <li><Link to="/reports">Relatórios</Link></li>
              <li><Link to="/configuracoes">Configurações</Link></li>
            </ul>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<BudgetStatusPage budgets={budgets} setBudgets={setBudgets} validadeOrcamento={validadeOrcamento} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/customers" element={<Customers customers={customers} setCustomers={setCustomers} />} />
            <Route path="/products" element={<Products products={products} setProducts={setProducts} />} />
            <Route path="/accessories" element={<Accessories accessories={accessories} setAccessories={setAccessories} />} />
            <Route path="/budgets" element={<BudgetStatusPage budgets={budgets} setBudgets={setBudgets} validadeOrcamento={validadeOrcamento} />} />
            <Route path="/budgets/new" element={<Budgets customers={customers} products={products} accessories={accessories} setCustomers={setCustomers} setBudgets={setBudgets} budgets={budgets} />} />
            <Route path="/budgets/:budgetId/view" element={<BudgetDetailsPage budgets={budgets} />} />
            <Route path="/budgets/:budgetId/edit" element={<Budgets customers={customers} products={products} accessories={accessories} setCustomers={setCustomers} setBudgets={setBudgets} budgets={budgets} />} /> {/* Changed route to Budgets component */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/configuracoes" element={<Configuracoes setCompanyLogo={setCompanyLogo} setValidadeOrcamento={setValidadeOrcamento} validadeOrcamento={validadeOrcamento} />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>© 2024 PersiFIX Sistemas</p>
        </footer>
      </div>
  );
}

export default App;
