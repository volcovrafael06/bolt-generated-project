import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import VisitScheduler from './VisitScheduler';
import { supabase } from '../supabase/client';

function HomePage({ budgets, customers, setCustomers, products, setProducts, accessories, setAccessories, visits, setVisits, setCompanyLogo }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from('clientes')
          .select('*');
        if (customersError) throw customersError;
        setCustomers(customersData || []);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('produtos')
          .select('*');
        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Fetch accessories
        const { data: accessoriesData, error: accessoriesError } = await supabase
          .from('accessories')
          .select('*');
        if (accessoriesError) throw accessoriesError;
        setAccessories(accessoriesData || []);

        // Fetch configurations
        const { data: configData, error: configError } = await supabase
          .from('configuracoes')
          .select('*')
          .single();
        if (configError) throw configError;
        setCompanyLogo(configData?.company_logo || null);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setCustomers, setProducts, setAccessories, setCompanyLogo]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h1>Bem-vindo!</h1>
      <Dashboard budgets={budgets} customers={customers} visits={visits} />
      <VisitScheduler visits={visits} setVisits={setVisits} />
    </div>
  );
}

export default HomePage;
