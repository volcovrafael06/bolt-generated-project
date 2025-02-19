import React, { useState } from 'react';
import { supabase } from '../supabase/client';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchInitialData = async () => {
    try {
      // Fetch configurations
      const { data: configData, error: configError } = await supabase
        .from('configuracoes')
        .select('*')
        .single();
      if (configError) throw configError;

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('clientes')
        .select('*')
        .order('name');
      if (customersError) throw customersError;

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('produtos')
        .select('*')
        .order('nome');
      if (productsError) throw productsError;

      // Fetch budgets with customer details
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('orcamentos')
        .select(`
          *,
          clientes (
            id,
            name,
            email,
            phone,
            address
          )
        `)
        .order('created_at', { ascending: false });
      if (budgetsError) throw budgetsError;

      // Fetch accessories
      const { data: accessoriesData, error: accessoriesError } = await supabase
        .from('accessories')
        .select('*')
        .order('name');
      if (accessoriesError) throw accessoriesError;

      return {
        config: configData,
        customers: customersData,
        products: productsData,
        budgets: budgetsData,
        accessories: accessoriesData
      };
    } catch (error) {
      console.error('Error fetching initial data:', error);
      throw error;
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setLoginError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setLoginError('');

    try {
      if (username === 'admin' && password === 'admin') {
        // Fetch all initial data
        const data = await fetchInitialData();
        onLogin('admin', data);
        setLoginError('');
      } else if (username === 'vendedor' && password === 'vendedor') {
        // Fetch all initial data
        const data = await fetchInitialData();
        onLogin('vendedor', data);
        setLoginError('');
      } else {
        setLoginError('Credenciais inválidas');
      }
    } catch (error) {
      setLoginError('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {loginError && <p className="error-message">{loginError}</p>}
      <div className="form-group">
        <label>Usuário</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuário"
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          disabled={loading}
        />
      </div>
      <button 
        onClick={handleLogin} 
        disabled={loading}
        className="login-button"
      >
        {loading ? 'Carregando...' : 'Entrar'}
      </button>
    </div>
  );
}

export default Login;
