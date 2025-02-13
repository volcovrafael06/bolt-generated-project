import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Budgets.css';

function Budgets({ customers = [], products = [], accessories = [], setCustomers, setBudgets, budgets = [] }) {
  const navigate = useNavigate();
  const { budgetId } = useParams();

  // Client states
  const [selectedClient, setSelectedClient] = useState(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    cpfCnpj: '',
    name: '',
    address: '',
    phone: '',
  });

  // Product states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [addedProducts, setAddedProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);

  // Accessory states
  const [selectedAccessory, setSelectedAccessory] = useState(null);
  const [addedAccessories, setAddedAccessories] = useState([]);

  // Other states
  const [installationPrice, setInstallationPrice] = useState(0);
  const [observation, setObservation] = useState('');

  useEffect(() => {
    if (budgetId) {
      const budget = budgets.find(b => b.id === parseInt(budgetId, 10));
      if (budget) {
        const client = customers.find(c => c.name === budget.customerName);
        setSelectedClient(client || null);
        setAddedProducts(budget.items?.filter(item => item.type === 'product') || []);
        setAddedAccessories(budget.items?.filter(item => item.type === 'accessory') || []);
        setObservation(budget.observation || '');
      }
    }
  }, [budgetId, budgets, customers]);

  const handleClientSelect = (e) => {
    const value = e.target.value;
    if (value === 'new') {
      setShowNewCustomerForm(true);
      setSelectedClient(null);
    } else {
      setShowNewCustomerForm(false);
      const client = customers.find(c => c.id === parseInt(value, 10));
      setSelectedClient(client || null);
    }
  };

  const handleNewCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newCustomer.name.trim()) {
      alert('Nome do cliente é obrigatório');
      return;
    }
    const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    const customerToAdd = { ...newCustomer, id: newId };
    setCustomers([...customers, customerToAdd]);
    setSelectedClient(customerToAdd);
    setShowNewCustomerForm(false);
    setNewCustomer({ cpfCnpj: '', name: '', address: '', phone: '' });
  };

  const handleProductSelect = (e) => {
    const product = products.find(p => p.id === parseInt(e.target.value, 10));
    setSelectedProduct(product || null);
    setLength('');
    setHeight('');
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      alert('Selecione um produto');
      return;
    }
    if (!length || isNaN(parseFloat(length))) {
      alert('Informe uma largura válida');
      return;
    }

    const isWaveModel = selectedProduct.model?.toLowerCase() === 'wave';
    if (!isWaveModel && (!height || isNaN(parseFloat(height)))) {
      alert('Informe uma altura válida');
      return;
    }

    const productPrice = selectedProduct.salePrice || 0;
    const calculatedPrice = isWaveModel
      ? productPrice * parseFloat(length)
      : productPrice * parseFloat(length) * parseFloat(height);

    const productToAdd = {
      type: 'product',
      item: selectedProduct,
      length: parseFloat(length),
      height: isWaveModel ? null : parseFloat(height),
      price: calculatedPrice,
      hasBando: false
    };

    if (editingProductId !== null) {
      const updatedProducts = [...addedProducts];
      updatedProducts[editingProductId] = productToAdd;
      setAddedProducts(updatedProducts);
      setEditingProductId(null);
    } else {
      setAddedProducts([...addedProducts, productToAdd]);
    }

    setSelectedProduct(null);
    setLength('');
    setHeight('');
    updateInstallationPrice([...addedProducts, productToAdd]);
  };

  const handleAccessorySelect = (e) => {
    const accessory = accessories.find(a => a.id === parseInt(e.target.value, 10));
    setSelectedAccessory(accessory || null);
  };

  const handleAddAccessory = () => {
    if (!selectedAccessory) return;
    
    const accessoryToAdd = {
      type: 'accessory',
      item: selectedAccessory,
      price: selectedAccessory.price || 0
    };
    
    setAddedAccessories([...addedAccessories, accessoryToAdd]);
    setSelectedAccessory(null);
  };

  const handleBandoChange = (index) => {
    const updatedProducts = [...addedProducts];
    const product = updatedProducts[index];
    if (!product) return;

    product.hasBando = !product.hasBando;
    const bandoPrice = (product.length || 0) * 120;
    product.price = product.hasBando
      ? (product.price || 0) + bandoPrice
      : (product.price || 0) - bandoPrice;
    
    setAddedProducts(updatedProducts);
  };

  const updateInstallationPrice = (products) => {
    setInstallationPrice((products?.length || 0) * 150);
  };

  const calculateTotal = () => {
    const productsTotal = addedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
    const accessoriesTotal = addedAccessories.reduce((sum, a) => sum + (a.price || 0), 0);
    return productsTotal + accessoriesTotal + installationPrice;
  };

  const handleFinalize = () => {
    if (!selectedClient) {
      alert('Selecione um cliente');
      return;
    }

    if (addedProducts.length === 0) {
      alert('Adicione pelo menos um produto');
      return;
    }

    const newBudget = {
      id: budgetId ? parseInt(budgetId, 10) : (budgets.length + 1),
      customerName: selectedClient.name,
      items: [...addedProducts, ...addedAccessories],
      installationPrice,
      observation,
      totalValue: calculateTotal(),
      status: 'pendente',
      creationDate: new Date().toISOString()
    };

    if (budgetId) {
      setBudgets(budgets.map(b => b.id === parseInt(budgetId, 10) ? newBudget : b));
    } else {
      setBudgets([...budgets, newBudget]);
    }

    navigate('/budgets');
  };

  return (
    <div className="budget-form">
      {/* Client Section */}
      <section className="section">
        <h2>Cliente</h2>
        <select value={selectedClient?.id || ''} onChange={handleClientSelect}>
          <option value="">Selecione um cliente</option>
          <option value="new">+ Novo Cliente</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>

        {showNewCustomerForm && (
          <form onSubmit={handleNewCustomerSubmit}>
            <input
              type="text"
              placeholder="Nome"
              value={newCustomer.name}
              onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="CPF/CNPJ"
              value={newCustomer.cpfCnpj}
              onChange={e => setNewCustomer({...newCustomer, cpfCnpj: e.target.value})}
            />
            <input
              type="text"
              placeholder="Endereço"
              value={newCustomer.address}
              onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
            />
            <input
              type="tel"
              placeholder="Telefone"
              value={newCustomer.phone}
              onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
            />
            <button type="submit">Adicionar Cliente</button>
          </form>
        )}
      </section>

      {/* Products Section */}
      <section className="section">
        <h2>Produtos</h2>
        <select onChange={handleProductSelect} value={selectedProduct?.id || ''}>
          <option value="">Selecione um produto</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} - {product.model} - {product.material} - {product.code}
            </option>
          ))}
        </select>

        {selectedProduct && (
          <div className="product-details">
            <input
              type="number"
              placeholder="Largura"
              value={length}
              onChange={e => setLength(e.target.value)}
              min="0"
              step="0.01"
            />
            {selectedProduct.model?.toLowerCase() !== 'wave' && (
              <input
                type="number"
                placeholder="Altura"
                value={height}
                onChange={e => setHeight(e.target.value)}
                min="0"
                step="0.01"
              />
            )}
            <button onClick={handleAddProduct}>
              {editingProductId !== null ? 'Atualizar Produto' : 'Adicionar Produto'}
            </button>
          </div>
        )}

        {addedProducts.length > 0 && (
          <div className="added-products">
            <h3>Produtos Adicionados:</h3>
            <ul>
              {addedProducts.map((product, index) => (
                <li key={index} className="added-product-item">
                  <div className="product-info">
                    <strong>Produto:</strong> {product.item?.name}<br />
                    <strong>Modelo:</strong> {product.item?.model}<br />
                    <strong>Material:</strong> {product.item?.material}<br />
                    <strong>Código:</strong> {product.item?.code}<br />
                    <strong>Dimensões:</strong> L: {product.length}
                    {product.height ? ` x A: ${product.height}` : ''} m2<br />
                    <strong>Preço:</strong> {product.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    <div className="product-options">
                      <label>
                        <input
                          type="checkbox"
                          checked={product.hasBando}
                          onChange={() => handleBandoChange(index)}
                        />
                        Bando ({(product.length * 120).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                      </label>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button onClick={() => handleEditProduct(index)}>Editar</button>
                    <button onClick={() => handleRemoveProduct(index)}>Remover</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Accessories Section */}
      <section className="section">
        <h2>Acessórios</h2>
        <select onChange={handleAccessorySelect} value={selectedAccessory?.id || ''}>
          <option value="">Selecione um acessório</option>
          {accessories.map(accessory => (
            <option key={accessory.id} value={accessory.id}>
              {accessory.name} - {accessory.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </option>
          ))}
        </select>
        {selectedAccessory && (
          <button onClick={handleAddAccessory}>Adicionar Acessório</button>
        )}

        {addedAccessories.length > 0 && (
          <div className="added-accessories">
            <h3>Acessórios Adicionados:</h3>
            <ul>
              {addedAccessories.map((accessory, index) => (
                <li key={index}>
                  {accessory.item?.name} - {accessory.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Installation Section */}
      <section className="section">
        <h2>Instalação</h2>
        <p>Valor da Instalação: {installationPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
      </section>

      {/* Observation Section */}
      <section className="section">
        <h2>Observação</h2>
        <textarea
          value={observation}
          onChange={e => setObservation(e.target.value)}
          rows="4"
        />
      </section>

      {/* Total */}
      <section className="section">
        <h2>Total do Orçamento: {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
      </section>

      {/* Finalize Button */}
      <button className="finalize-button" onClick={handleFinalize}>
        {budgetId ? 'Atualizar Orçamento' : 'Concluir Orçamento'}
      </button>
    </div>
  );
}

export default Budgets;
