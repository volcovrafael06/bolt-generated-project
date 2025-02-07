import React, { useState, useEffect } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import Budgets from './components/Budgets'
import Customers from './components/Customers'
import Products from './components/Products'
import PaymentMethods from './components/PaymentMethods'
import Login from './components/Login'
import Reports from './components/Reports'
import Accessories from './components/Accessories'
import BudgetStatusPage from './components/BudgetStatusPage'; // Import BudgetStatusPage

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [budgets, setBudgets] = useState([ // Dummy budget data - centralize here if needed
    { id: 1, customerName: 'Client A', status: 'pending', totalValue: 1500.00 },
    { id: 2, customerName: 'Client B', status: 'finalized', totalValue: 2200.50 },
    { id: 3, customerName: 'Client C', status: 'pending', totalValue: 850.20 },
  ]);


    useEffect(() => {
    // Fetch customers (replace with your actual data fetching)
    const initialCustomers = [
      { id: 1, name: 'Client A', phone: '123-456-7890', email: 'a@example.com', address: '123 Main St' },
      { id: 2, name: 'Client B', phone: '987-654-3210', email: 'b@example.com', address: '456 Oak Ave' },
    ];
    setCustomers(initialCustomers);

    // Fetch/Set initial products (replace with your actual product data)
    const initialProducts = [
      { id: 1, product: 'Product A', model: 'Model X', material: 'Material 1', name: 'Name 1', code: 'Code1', salePrice: 10, calculationMethod: 'm2', length: 0 },
      { id: 2, product: 'Product B', model: 'Model Y', material: 'Material 2', name: 'Name 2', code: 'Code2', salePrice: 20, calculationMethod: 'Comprimento', length: 5 },
    ];
    setProducts(initialProducts);

    // Initialize payment methods (replace with your actual data)
    const initialPaymentMethods = [
      { id: 1, name: 'Credit Card' },
      { id: 2, name: 'Debit Card' },
      { id: 3, name: 'Cash' },
    ];
    setPaymentMethods(initialPaymentMethods);

    // Initialize accessories
    setAccessories([]);
  }, []);

  const handleLogin = (userRole) => {
    console.log("Logged in as:", userRole);
    setIsLoggedIn(true);
  };


  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div>
      <h1>PersiFIX</h1>
      <nav>
        <ul>
          <li>
            <NavLink to="/budgets">Orçamentos</NavLink>
          </li>
          <li>
            <NavLink to="/customers">Clientes</NavLink>
          </li>
          <li>
            <NavLink to="/products">Produtos</NavLink>
          </li>
          <li>
            <NavLink to="/payment-methods">Formas de Pagamento</NavLink>
          </li>
          <li>
            <NavLink to="/reports">Relatórios</NavLink>
          </li>
          <li>
            <NavLink to="/accessories">Acessórios</NavLink> {/* New NavLink */}
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/budgets" element={<Budgets customers={customers} products={products} paymentMethods={paymentMethods} accessories={accessories} setCustomers={setCustomers} />} />
        <Route path="/budgets-status" element={<BudgetStatusPage budgets={budgets} />} /> {/* New Route for BudgetStatusPage */}
        <Route path="/customers" element={<Customers customers={customers} setCustomers={setCustomers} />} />
        <Route path="/products" element={<Products products={products} setProducts={setProducts} />} />
        <Route path="/payment-methods" element={<PaymentMethods paymentMethods={paymentMethods} setPaymentMethods={setPaymentMethods} />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/accessories" element={<Accessories accessories={accessories} setAccessories={setAccessories} />} />
      </Routes>
    </div>
  )
}

export default App
