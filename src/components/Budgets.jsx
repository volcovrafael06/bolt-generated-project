import React, { useState, useEffect } from 'react';
import { clienteService } from '../services/clienteService';
import { produtoService } from '../services/produtoService';
import { orcamentoService } from '../services/orcamentoService';
import ProductSelector from './ProductSelector';
import Customers from './Customers';
import './Budgets.css';

function Budgets() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethods] = useState([
    'À Vista', 
    'Boleto', 
    'Cartão de Crédito', 
    'Cartão de Débito', 
    'Pix', 
    'Transferência Bancária'
  ]);

  const [budgetDetails, setBudgetDetails] = useState({
    observation: '',
    paymentMethod: '',
    installationValue: 0,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [customerData, productData] = await Promise.all([
        clienteService.getAll(),
        produtoService.getAll()
      ]);

      setCustomers(customerData);
      setProducts(productData);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (event) => {
    const customerId = event.target.value;
    const customer = customers.find(c => c.id === parseInt(customerId, 10));
    setSelectedCustomer(customer);
  };

  const handleProductSelect = (product) => {
    const newProduct = {
      ...product,
      width: 0,
      length: 0,
      height: 0,
      m2: 0,
      hasInstallation: false,
      hasBando: false,
      bandoValue: 0,
      totalValue: 0
    };
    setSelectedProducts([...selectedProducts, newProduct]);
    setShowProductSelector(false);
  };

  const updateProductDetails = (index, updates) => {
    const updatedProducts = [...selectedProducts];
    const product = updatedProducts[index];
    
    const newProduct = { ...product, ...updates };

    // Calculation logic based on product type and calculation method
    if (newProduct.calculation_method === 'm2') {
      newProduct.m2 = newProduct.length * newProduct.height;
      newProduct.totalValue = newProduct.m2 * newProduct.sale_price;
    } else if (newProduct.product === 'WAVE') {
      newProduct.totalValue = newProduct.width * newProduct.sale_price;
    } else {
      newProduct.totalValue = newProduct.width * newProduct.height * newProduct.sale_price;
    }

    // Bando calculation
    if (newProduct.hasBando) {
      newProduct.bandoValue = newProduct.width * 120;
    } else {
      newProduct.bandoValue = 0;
    }

    updatedProducts[index] = newProduct;
    setSelectedProducts(updatedProducts);
  };

  const removeProduct = (indexToRemove) => {
    setSelectedProducts(selectedProducts.filter((_, index) => index !== indexToRemove));
  };

  const calculateTotalBudget = () => {
    const productTotal = selectedProducts.reduce((total, product) => total + product.totalValue, 0);
    const installationTotal = budgetDetails.installationValue || 0;
    const bandoTotal = selectedProducts.reduce((total, product) => total + (product.bandoValue || 0), 0);
    
    return productTotal + installationTotal + bandoTotal;
  };

  const handleCreateBudget = async () => {
    if (!selectedCustomer || selectedProducts.length === 0) {
      alert('Por favor, selecione um cliente e adicione produtos.');
      return;
    }

    try {
      const budgetData = {
        cliente_id: selectedCustomer.id,
        produtos: selectedProducts,
        observacao: budgetDetails.observation,
        forma_pagamento: budgetDetails.paymentMethod,
        valor_instalacao: budgetDetails.installationValue,
        valor_total: calculateTotalBudget()
      };

      await orcamentoService.create(budgetData);
      alert('Orçamento criado com sucesso!');
      
      // Reset form
      setSelectedCustomer(null);
      setSelectedProducts([]);
      setBudgetDetails({
        observation: '',
        paymentMethod: '',
        installationValue: 0
      });
    } catch (err) {
      setError('Erro ao criar orçamento: ' + err.message);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="budgets-container">
      <h2>Novo Orçamento</h2>
      
      {/* Customer Selection */}
      <div className="customer-section">
        <h3>Selecione o Cliente</h3>
        <div className="customer-selection">
          <select 
            value={selectedCustomer ? selectedCustomer.id : ''} 
            onChange={handleCustomerChange}
          >
            <option value="" disabled>Selecione um cliente</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.phone}
              </option>
            ))}
          </select>
          <button onClick={() => setShowCustomerForm(!showCustomerForm)}>
            {showCustomerForm ? 'Cancelar' : 'Novo Cliente'}
          </button>
        </div>

        {showCustomerForm && (
          <div className="customer-form-modal">
            <Customers onCustomerCreated={(newCustomer) => {
              setCustomers([...customers, newCustomer]);
              setSelectedCustomer(newCustomer);
              setShowCustomerForm(false);
            }} />
          </div>
        )}

        {selectedCustomer && (
          <div className="selected-customer-details">
            <p>Nome: {selectedCustomer.name}</p>
            <p>Telefone: {selectedCustomer.phone}</p>
            <p>Email: {selectedCustomer.email}</p>
          </div>
        )}
      </div>
      
      {/* Products Section */}
      <div className="products-section">
        <h3>Produtos</h3>
        <button onClick={() => setShowProductSelector(!showProductSelector)}>
          Adicionar Produto
        </button>

        {showProductSelector && (
          <div className="product-selector-modal">
            <ProductSelector onSelect={handleProductSelect} />
          </div>
        )}

        {selectedProducts.map((product, index) => (
          <div key={index} className="selected-product-details">
            <h4>{product.name}</h4>
            
            {/* Measurement Fields */}
            {product.calculation_method === 'm2' ? (
              <div className="measurement-fields">
                <div className="form-group">
                  <label>Comprimento:</label>
                  <input 
                    type="number" 
                    value={product.length} 
                    onChange={(e) => updateProductDetails(index, { length: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Altura:</label>
                  <input 
                    type="number" 
                    value={product.height} 
                    onChange={(e) => updateProductDetails(index, { height: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>M²:</label>
                  <input 
                    type="number" 
                    value={product.m2} 
                    readOnly 
                  />
                </div>
              </div>
            ) : product.product === 'WAVE' ? (
              <div className="measurement-fields">
                <div className="form-group">
                  <label>Largura:</label>
                  <input 
                    type="number" 
                    value={product.width} 
                    onChange={(e) => updateProductDetails(index, { width: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            ) : (
              <div className="measurement-fields">
                <div className="form-group">
                  <label>Largura:</label>
                  <input 
                    type="number" 
                    value={product.width} 
                    onChange={(e) => updateProductDetails(index, { width: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Altura:</label>
                  <input 
                    type="number" 
                    value={product.height} 
                    onChange={(e) => updateProductDetails(index, { height: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {/* Bando Checkbox */}
            <div className="form-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={product.hasBando}
                  onChange={(e) => updateProductDetails(index, { hasBando: e.target.checked })}
                />
                Bandô
              </label>
              {product.hasBando && (
                <div>Valor do Bandô: R$ {product.bandoValue.toFixed(2)}</div>
              )}
            </div>

            {/* Total Value */}
            <div className="product-total">
              <strong>Total do Produto: R$ {product.totalValue.toFixed(2)}</strong>
            </div>

            <button onClick={() => removeProduct(index)}>Remover Produto</button>
          </div>
        ))}
      </div>

      {/* Additional Budget Details */}
      <div className="budget-details">
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={!!budgetDetails.installationValue}
              onChange={(e) => setBudgetDetails(prev => ({
                ...prev, 
                installationValue: e.target.checked ? 0 : null
              }))}
            />
            Valor de Instalação
          </label>
          {budgetDetails.installationValue !== null && (
            <input 
              type="number" 
              value={budgetDetails.installationValue}
              onChange={(e) => setBudgetDetails(prev => ({
                ...prev, 
                installationValue: parseFloat(e.target.value)
              }))}
              placeholder="Digite o valor da instalação"
            />
          )}
        </div>

        <div className="form-group">
          <label>Forma de Pagamento:</label>
          <select 
            value={budgetDetails.paymentMethod}
            onChange={(e) => setBudgetDetails(prev => ({
              ...prev, 
              paymentMethod: e.target.value
            }))}
          >
            <option value="">Selecione</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Observações:</label>
          <textarea 
            value={budgetDetails.observation}
            onChange={(e) => setBudgetDetails(prev => ({
              ...prev, 
              observation: e.target.value
            }))}
            placeholder="Observações adicionais"
          />
        </div>
      </div>

      {/* Total Budget */}
      <div className="budget-total">
        <h3>Total do Orçamento: R$ {calculateTotalBudget().toFixed(2)}</h3>
      </div>

      {/* Create Budget Button */}
      <div className="budget-submission">
        <button 
          onClick={handleCreateBudget}
          disabled={!selectedCustomer || selectedProducts.length === 0}
        >
          Criar Orçamento
        </button>
      </div>
    </div>
  );
}

export default Budgets;
