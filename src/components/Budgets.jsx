import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orcamentoService } from '../services/orcamentoService';
import { clienteService } from '../services/clienteService';
import { produtoService } from '../services/produtoService';

function Budgets() {
  const navigate = useNavigate();
  const { budgetId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for data
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedProducts, setAddedProducts] = useState([]);
  const [installationPrice, setInstallationPrice] = useState(0);
  const [observation, setObservation] = useState('');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [customersData, productsData] = await Promise.all([
          clienteService.getAll(),
          produtoService.getAll()
        ]);
        
        setCustomers(customersData);
        setProducts(productsData);

        if (budgetId) {
          const budget = await orcamentoService.getById(budgetId);
          if (budget) {
            setSelectedClient(budget.customer_id);
            setAddedProducts(budget.items || []);
            setInstallationPrice(budget.installation_price || 0);
            setObservation(budget.observation || '');
          }
        }
      } catch (err) {
        setError('Erro ao carregar dados: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [budgetId]);

  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    const client = customers.find(c => c.id === clientId);
    setSelectedClient(client);
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
  };

  const handleAddProduct = () => {
    if (!selectedProduct) return;
    
    setAddedProducts(prev => [...prev, {
      product_id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.sale_price,
      quantity: 1
    }]);
    
    setSelectedProduct(null);
  };

  const handleRemoveProduct = (index) => {
    setAddedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const productsTotal = addedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    return productsTotal + installationPrice;
  };

  const handleSubmit = async () => {
    if (!selectedClient) {
      alert('Selecione um cliente');
      return;
    }

    if (addedProducts.length === 0) {
      alert('Adicione pelo menos um produto');
      return;
    }

    try {
      const budgetData = {
        customer_id: selectedClient.id,
        items: addedProducts,
        installation_price: installationPrice,
        total_value: calculateTotal(),
        observation,
        status: 'pendente'
      };

      if (budgetId) {
        await orcamentoService.update(budgetId, budgetData);
      } else {
        await orcamentoService.create(budgetData);
      }

      navigate('/budgets');
    } catch (err) {
      setError('Erro ao salvar orçamento: ' + err.message);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="budget-form">
      <h2>{budgetId ? 'Editar Orçamento' : 'Novo Orçamento'}</h2>

      <section className="section">
        <h3>Cliente</h3>
        <select value={selectedClient?.id || ''} onChange={handleClientSelect}>
          <option value="">Selecione um cliente</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </section>

      <section className="section">
        <h3>Produtos</h3>
        <select value={selectedProduct?.id || ''} onChange={handleProductSelect}>
          <option value="">Selecione um produto</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} - {product.model} - R$ {product.sale_price}
            </option>
          ))}
        </select>
        {selectedProduct && (
          <button onClick={handleAddProduct}>Adicionar Produto</button>
        )}

        {addedProducts.length > 0 && (
          <div className="added-products">
            <h4>Produtos Adicionados:</h4>
            <ul>
              {addedProducts.map((product, index) => (
                <li key={index}>
                  {product.name} - R$ {product.price}
                  <button onClick={() => handleRemoveProduct(index)}>Remover</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="section">
        <h3>Instalação</h3>
        <input
          type="number"
          value={installationPrice}
          onChange={(e) => setInstallationPrice(parseFloat(e.target.value) || 0)}
          placeholder="Valor da instalação"
        />
      </section>

      <section className="section">
        <h3>Observações</h3>
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          rows="4"
        />
      </section>

      <section className="section">
        <h3>Total do Orçamento: R$ {calculateTotal()}</h3>
      </section>

      <button className="finalize-button" onClick={handleSubmit}>
        {budgetId ? 'Atualizar Orçamento' : 'Finalizar Orçamento'}
      </button>
    </div>
  );
}

export default Budgets;
