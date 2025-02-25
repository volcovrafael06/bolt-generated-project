import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
import BudgetDetailsPage from './components/BudgetDetailsPage';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import { supabase } from './supabase/client';
import TestDB from './components/TestDB';
import { authService } from './services/authService';
import { syncService } from './services/syncService';
import { localDB } from './services/localDatabase';
import VisitScheduler from './components/VisitScheduler';

function App() {
  const [companyLogo, setCompanyLogo] = useState(null);
  const [validadeOrcamento, setValidadeOrcamento] = useState('30');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    loadFromCache();
    syncData();
    fetchVisits();
    
    const syncInterval = setInterval(syncData, 30 * 60 * 1000);
    return () => clearInterval(syncInterval);
  }, []);

  const loadFromCache = async () => {
    try {
      setLoading(true);
      const [
        localBudgets,
        localCustomers,
        localProducts,
        localAccessories,
        localConfig
      ] = await Promise.all([
        localDB.getAll('orcamentos'),
        localDB.getAll('clientes'),
        localDB.getAll('produtos'),
        localDB.getAll('accessories'),
        localDB.get('configuracoes', 1)
      ]);

      if (localBudgets?.length) setBudgets(localBudgets);
      if (localCustomers?.length) setCustomers(localCustomers);
      if (localProducts?.length) setProducts(localProducts);
      if (localAccessories?.length) setAccessories(localAccessories);
      if (localConfig?.company_logo) setCompanyLogo(localConfig.company_logo);
    } catch (error) {
      console.error('Error loading from cache:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncData = async () => {
    if (syncing) return; 
    try {
      setSyncing(true);
      await syncService.syncAll();
      
      const [
        updatedBudgets,
        updatedCustomers,
        updatedProducts,
        updatedAccessories,
        updatedConfig
      ] = await Promise.all([
        localDB.getAll('orcamentos'),
        localDB.getAll('clientes'),
        localDB.getAll('produtos'),
        localDB.getAll('accessories'),
        localDB.get('configuracoes', 1)
      ]);

      setBudgets(updatedBudgets);
      setCustomers(updatedCustomers);
      setProducts(updatedProducts);
      setAccessories(updatedAccessories);
      if (updatedConfig?.company_logo) setCompanyLogo(updatedConfig.company_logo);
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setSyncing(false);
    }
  };

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .order('date_time', { ascending: true });

      if (error) {
        console.error('Error fetching visits:', error);
        return;
      }

      setVisits(data || []);
    } catch (error) {
      console.error('Error in fetchVisits:', error);
    }
  };

  const handleLogin = (user) => {
    setLoggedInUser(user);
    navigate("/");
  };

  const handleLogout = () => {
    authService.logout();
    setLoggedInUser(null);
    navigate("/login");
  };

  const handleFinalizeBudget = (budgetId) => {
    const updatedBudgets = budgets.map(budget =>
      budget.id === budgetId ? { ...budget, status: 'finalizado' } : budget
    );
    setBudgets(updatedBudgets);
  };

  const handleCancelBudget = (budgetId) => {
    const updatedBudgets = budgets.map(budget =>
      budget.id === budgetId ? { ...budget, status: 'cancelado' } : budget
    );
    setBudgets(updatedBudgets);
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="app">
      {loggedInUser && (
        <>
          <button 
            className="menu-toggle" 
            onClick={toggleSidebar}
            aria-label="Toggle Menu"
          >
            {sidebarExpanded ? '✕' : '☰'}
          </button>
          
          {companyLogo && (
            <img 
              src={companyLogo} 
              alt="Logo da Empresa" 
              className="company-logo"
            />
          )}

          <div className={`sidebar ${sidebarExpanded ? 'expanded' : ''}`}>
            <nav>
              <ul className="nav-list">
                <li className="nav-item">
                  <NavLink to="/" className="nav-link">
                    <span className="icon">🏠</span>
                    <span className="text">Home</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/customers" className="nav-link">
                    <span className="icon">👥</span>
                    <span className="text">Clientes</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/products" className="nav-link">
                    <span className="icon">📦</span>
                    <span className="text">Produtos</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/accessories" className="nav-link">
                    <span className="icon">🔧</span>
                    <span className="text">Acessórios</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/budgets" className="nav-link">
                    <span className="icon">📝</span>
                    <span className="text">Orçamentos</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/reports" className="nav-link">
                    <span className="icon">📊</span>
                    <span className="text">Relatórios</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/visits" className="nav-link">
                    <span className="icon">📅</span>
                    <span className="text">Visitas</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/configuracoes" className="nav-link">
                    <span className="icon">⚙️</span>
                    <span className="text">Configurações</span>
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
          <main className={`main-content ${sidebarExpanded ? 'expanded' : ''}`}>
            <Routes>
              <Route 
                path="/" 
                element={
                  loggedInUser ? (
                    <HomePage 
                      budgets={budgets} 
                      customers={customers} 
                      setCustomers={setCustomers} 
                      products={products} 
                      setProducts={setProducts} 
                      accessories={accessories} 
                      setAccessories={setAccessories} 
                      visits={visits} 
                      setVisits={setVisits}
                      setCompanyLogo={setCompanyLogo}
                      companyLogo={companyLogo}
                    />
                  ) : (
                    <Login onLogin={handleLogin} />
                  )
                } 
              />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route 
                path="/customers" 
                element={
                  authService.hasAccess('admin') ? (
                    <Customers 
                      customers={customers} 
                      setCustomers={setCustomers} 
                    />
                  ) : (
                    <div>Acesso negado.</div>
                  )
                } 
              />
              <Route 
                path="/products" 
                element={
                  authService.hasAccess('admin') ? (
                    <Products 
                      products={products} 
                      setProducts={setProducts} 
                    />
                  ) : (
                    <div>Acesso negado.</div>
                  )
                } 
              />
              <Route 
                path="/accessories" 
                element={
                  authService.hasAccess('admin') ? (
                    <Accessories 
                      accessories={accessories} 
                      setAccessories={setAccessories} 
                    />
                  ) : (
                    <div>Acesso negado.</div>
                  )
                } 
              />
              <Route 
                path="/budgets" 
                element={
                  <BudgetList 
                    budgets={budgets}
                    validadeOrcamento={validadeOrcamento}
                    onFinalizeBudget={async (budgetId) => {
                      try {
                        const { error } = await supabase
                          .from('orcamentos')
                          .update({ status: 'finalizado' })
                          .eq('id', budgetId);

                        if (error) throw error;

                        // Atualizar o estado e o cache local
                        const updatedBudgets = budgets.map(budget =>
                          budget.id === budgetId ? { ...budget, status: 'finalizado' } : budget
                        );
                        setBudgets(updatedBudgets);
                        await localDB.putAll('orcamentos', updatedBudgets);
                        
                        alert(`Orçamento ${budgetId} finalizado com sucesso.`);
                      } catch (error) {
                        console.error('Error finalizing budget:', error);
                        alert('Erro ao finalizar orçamento.');
                      }
                    }}
                    onCancelBudget={async (budgetId) => {
                      try {
                        const { error } = await supabase
                          .from('orcamentos')
                          .update({ status: 'cancelado' })
                          .eq('id', budgetId);

                        if (error) throw error;

                        // Atualizar o estado e o cache local
                        const updatedBudgets = budgets.map(budget =>
                          budget.id === budgetId ? { ...budget, status: 'cancelado' } : budget
                        );
                        setBudgets(updatedBudgets);
                        await localDB.putAll('orcamentos', updatedBudgets);
                        
                        alert(`Orçamento ${budgetId} cancelado com sucesso.`);
                      } catch (error) {
                        console.error('Error canceling budget:', error);
                        alert('Erro ao cancelar orçamento.');
                      }
                    }}
                  />
                }
              />
              <Route 
                path="/budgets/new" 
                element={
                  <Budgets 
                    budgets={budgets}
                    setBudgets={setBudgets}
                    customers={customers}
                    setCustomers={setCustomers}
                    products={products}
                    setProducts={setProducts}
                    accessories={accessories}
                    setAccessories={setAccessories}
                  />
                } 
              />
              <Route 
                path="/budgets/:budgetId/view" 
                element={
                  <BudgetDetailsPage 
                    budgets={budgets}
                    companyLogo={companyLogo}
                  />
                } 
              />
              <Route 
                path="/budgets/:budgetId/edit" 
                element={
                  <Budgets 
                    budgets={budgets}
                    setBudgets={setBudgets}
                    customers={customers}
                    setCustomers={setCustomers}
                    products={products}
                    setProducts={setProducts}
                    accessories={accessories}
                    setAccessories={setAccessories}
                  />
                } 
              />
              <Route 
                path="/reports" 
                element={
                  authService.hasAccess('admin') ? (
                    <Reports budgets={budgets} />
                  ) : (
                    <div>Acesso negado.</div>
                  )
                } 
              />
              <Route 
                path="/configuracoes" 
                element={
                  authService.hasAccess('admin') ? (
                    <Configuracoes 
                      setCompanyLogo={setCompanyLogo} 
                      setValidadeOrcamento={setValidadeOrcamento} 
                      validadeOrcamento={validadeOrcamento} 
                    />
                  ) : (
                    <div>Acesso negado.</div>
                  )
                } 
              />
              <Route 
                path="/visits" 
                element={
                  authService.hasAccess('admin') ? (
                    <VisitScheduler 
                      visits={visits} 
                      setVisits={setVisits}
                    />
                  ) : (
                    <div>Acesso negado.</div>
                  )
                } 
              />
              <Route path="/test-db" element={<TestDB />} />
            </Routes>
          </main>
        </>
      )}

      <footer className="app-footer">
        <p> 2025 Vecchio Sistemas</p>
      </footer>
    </div>
  );
}

export default App;
