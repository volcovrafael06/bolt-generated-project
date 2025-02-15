import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import SelectOrCreate from './SelectOrCreate';
import './Budgets.css';

function Budgets({ budgets, setBudgets }) {
  const [newBudget, setNewBudget] = useState({
    customer: null,
    product: null,
    bando: false,
    installation: false,
    accessories: [],
    observation: '',
  });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [accessoriesList, setAccessoriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [budgetAccessories, setBudgetAccessories] = useState({});

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchAccessories();
    // Fetch accessories for existing budgets
    if (budgets && budgets.length > 0) {
      fetchBudgetAccessories(budgets);
    }
  }, [budgets]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from('clientes').select('*');
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('produtos').select('*');
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchAccessories = async () => {
    try {
      const { data, error } = await supabase.from('accessories').select('*');
      if (error) throw error;
      setAccessoriesList(data || []);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchBudgetAccessories = async (budgets) => {
    const accessoriesMap = {};
    for (const budget of budgets) {
      if (budget.accessories && budget.accessories.length > 0) {
        const accessoryDetails = await Promise.all(
          budget.accessories.map(async (accessoryId) => {
            try {
              const { data, error } = await supabase
                .from('accessories')
                .select('*')
                .eq('id', accessoryId)
                .single();
              if (error) {
                console.error('Error fetching accessory:', accessoryId, error);
                return `ID: ${accessoryId} (Erro ao carregar)`;
              }
              return `${data.produto} - ${data.unit}`; // Adjust based on your accessories table structure
            } catch (err) {
              console.error('Error fetching accessory:', accessoryId, err);
              return `ID: ${accessoryId} (Erro ao carregar)`;
            }
          })
        );
        accessoriesMap[budget.id] = accessoryDetails.join(', ');
      } else {
        accessoriesMap[budget.id] = 'Nenhum';
      }
    }
    setBudgetAccessories(accessoriesMap);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setNewBudget((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleCustomerChange = (selectedCustomer) => {
    setNewBudget((prev) => ({ ...prev, customer: selectedCustomer }));
  };

  const handleProductChange = (selectedProduct) => {
    setNewBudget((prev) => ({ ...prev, product: selectedProduct }));
  };

  const handleAccessoriesChange = (selectedAccessories) => {
    setNewBudget((prev) => ({
      ...prev,
      accessories: selectedAccessories,
    }));
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.from('orcamentos').insert([
        {
          customer_id: newBudget.customer ? newBudget.customer.id : null,
          product_id: newBudget.product ? newBudget.product.id : null,
          bando: newBudget.bando,
          installation: newBudget.installation,
          accessories: newBudget.accessories.map((acc) => acc.id),
          observation: newBudget.observation,
        },
      ]).select();

      if (error) throw error;

      // Fetch the names of the accessories for the new budget
      if (data && data.length > 0) {
        const newBudgetAccessories = await Promise.all(
          data[0].accessories.map(async (accessoryId) => {
            try {
              const { data: accessoryData, error: accessoryError } = await supabase
                .from('accessories')
                .select('*')
                .eq('id', accessoryId)
                .single();

              if (accessoryError) {
                console.error('Error fetching accessory:', accessoryId, accessoryError);
                return `ID: ${accessoryId} (Erro ao carregar)`;
              }

              const product = products.find((p) => p.id === accessoryData.produto);
              const productName = product ? product.nome : 'Unknown Product';

              return `${productName} - ${accessoryData.unit}`;
            } catch (err) {
              console.error('Error fetching accessory:', accessoryId, err);
              return `ID: ${accessoryId} (Erro ao carregar)`;
            }
          })
        );

        setBudgetAccessories((prevAccessories) => ({
          ...prevAccessories,
          [data[0].id]: newBudgetAccessories.join(', '),
        }));
      }

      setBudgets((prevBudgets) => [...prevBudgets, data[0]]);
      setNewBudget({
        customer: null,
        product: null,
        bando: false,
        installation: false,
        accessories: [],
        observation: '',
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="budgets-container">
      <h2>Orçamentos</h2>
      <form onSubmit={handleAddBudget}>
        <div className="form-group">
          <label htmlFor="customer">Cliente:</label>
          <SelectOrCreate
            id="customer"
            name="customer"
            options={customers}
            labelKey="nome"
            valueKey="id"
            onChange={handleCustomerChange}
            onCreate={async (newCustomerName) => {
              try {
                const { data, error } = await supabase
                  .from('clientes')
                  .insert([{ nome: newCustomerName }])
                  .select();
                if (error) throw error;
                setCustomers([...customers, data[0]]);
                return data[0];
              } catch (error) {
                setError(error.message);
                return null;
              }
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="product">Produto:</label>
          <select
            id="product"
            name="product"
            onChange={handleProductChange}
          >
            <option value="">Selecione um produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {`${product.produto} - ${product.modelo} - ${product.tecido} - ${product.nome} - ${product.codigo} - Preço: ${product.preco_venda}`}
              </option>
            ))}
          </select>
          {newBudget.product && (
            <div className="product-details">
              <p>Produto: {newBudget.product.produto}</p>
              <p>Modelo: {newBudget.product.modelo}</p>
              <p>Tecido: {newBudget.product.tecido}</p>
              <p>Nome: {newBudget.product.nome}</p>
              <p>Código: {newBudget.product.codigo}</p>
              <p>Preço: {newBudget.product.preco_venda}</p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="bando">Bandô:</label>
          <select
            id="bando"
            name="bando"
            value={newBudget.bando}
            onChange={handleInputChange}
          >
            <option value={false}>Não</option>
            <option value={true}>Sim</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="installation">Instalação:</label>
          <select
            id="installation"
            name="installation"
            value={newBudget.installation}
            onChange={handleInputChange}
          >
            <option value={false}>Não</option>
            <option value={true}>Sim</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="accessories">Acessórios:</label>
          <select
            id="accessories"
            name="accessories"
            multiple
            onChange={(e) => {
              const selectedAccessoryIds = Array.from(
                e.target.selectedOptions,
                (option) => parseInt(option.value)
              );
              const selectedAccessories = accessoriesList.filter((accessory) =>
                selectedAccessoryIds.includes(accessory.id)
              );
              handleAccessoriesChange(selectedAccessories);
            }}
          >
            {accessoriesList.map((accessory) => {
              try {
                const produto = products.find((p) => p.id === accessory.produto);
                const produtoName = produto ? produto.nome : 'Unknown Product';

                return (
                  <option key={accessory.id} value={accessory.id}>
                    {produtoName} - {accessory.unit}
                  </option>
                );
              } catch (e) {
                console.error("Error rendering accessory:", accessory, e);
                return null;
              }
            })}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="observation">Observações:</label>
          <textarea
            id="observation"
            name="observation"
            value={newBudget.observation}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Finalizar Orçamento'}
        </button>
      </form>

      <ul>
        {budgets.map((budget) => (
          <li key={budget.id}>
            Cliente: {budget.customer_id}, Produto: {budget.product_id},
            Bandô: {budget.bando ? 'Sim' : 'Não'}, Instalação:{' '}
            {budget.installation ? 'Sim' : 'Não'}, Acessórios:{' '}
            {budgetAccessories[budget.id] ? budgetAccessories[budget.id] : 'Nenhum'}, Observações: {budget.observation}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Budgets;
