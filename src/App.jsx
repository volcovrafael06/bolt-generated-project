import React, { useState } from 'react'
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import Customers from './components/Customers'
import Products from './components/Products'
import Budgets from './components/Budgets'
import Reports from './components/Reports'
import Login from './components/Login'

function AdminLayout({ customers, setCustomers, products, setProducts }) {
  return (
    <div className="admin-layout">
      <nav>
        <ul>
          <li><Link to="/admin/customers">Clientes</Link></li>
          <li><Link to="/admin/products">Produtos</Link></li>
          <li><Link to="/admin/budgets">Orçamentos</Link></li>
          <li><Link to="/admin/reports">Relatórios</Link></li>
        </ul>
      </nav>
      <div className="content">
        <Routes>
          <Route path="/customers" element={<Customers customers={customers} setCustomers={setCustomers} />} />
          <Route path="/products" element={<Products products={products} setProducts={setProducts} />} />
          <Route path="/budgets" element={<Budgets customers={customers} products={products} />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </div>
  )
}

function VendedorLayout({ customers, setCustomers, products }) {
  return (
    <div className="vendedor-layout">
      <nav>
        <ul>
          <li><Link to="/vendedor/budgets">Orçamentos</Link></li>
          <li><Link to="/vendedor/customers">Clientes</Link></li>
        </ul>
      </nav>
      <div className="content">
        <Routes>
          <Route path="/budgets" element={<Budgets customers={customers} products={products} />} />
          <Route path="/customers" element={<Customers customers={customers} setCustomers={setCustomers} />} />
        </Routes>
      </div>
    </div>
  )
}

function ProtectedRoute({ role, children, redirectPath = '/' }) {
  const [user] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  if (!user || user.role !== role) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}


function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [customers, setCustomers] = useState([
    { id: 1, name: 'John Doe', phone: '123-456-7890', email: 'john@example.com', address: '123 Main St' },
    { id: 2, name: 'Jane Smith', phone: '987-654-3210', email: 'jane@example.com', address: '456 Oak Ave' },
  ])
  const [products, setProducts] = useState([
     {
      id: 1,
      category: 'Persiana de Rolo',
      material: 'TECIDO DOUBLE VISION',
      model: 'DOUBLE VISION',
      referenceCode: '40010-40015',
      largura: 3.00,
      price: 135.01,
      cost: 264.75,
      color: 'Various'
    },
    {
      id: 2,
      category: 'Persiana de Rolo',
      material: 'TECIDO DOUBLE VISION',
      model: 'DOUBLE VISION LARGE',
      referenceCode: '40021-40026',
      largura: 2.50,
      price: 264.75,
      cost: 464.00,
      color: 'Various'
    },
    {
      id: 3,
      category: 'Cortina',
      material: 'LINHO',
      model: 'ROMANA',
      referenceCode: 'CR-LI-BG',
      largura: null,
      price: 200.00,
      cost: 100.00,
      color: 'Bege'
    }
  ])
  const navigate = useNavigate()

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/')
  }

  return (
    <div className="App">
      <header>
        <h1>PersiFIX - Aplicativo de Gerenciamento de Orçamentos</h1>
        {user && (
          <div className="auth-info">
            <span>Usuário: {user.username} ({user.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>

      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/admin/*" element={
          <ProtectedRoute role="admin">
            <AdminLayout customers={customers} setCustomers={setCustomers} products={products} setProducts={setProducts} />
          </ProtectedRoute>
        } />
        <Route path="/vendedor/*" element={
          <ProtectedRoute role="vendedor">
            <VendedorLayout customers={customers} setCustomers={setCustomers} products={products} />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App
