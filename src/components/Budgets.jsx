import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function Budgets({ customers, products, accessories, setCustomers, setBudgets, budgets }) {
  const navigate = useNavigate();
  const { budgetId } = useParams() || {};

  // Local state for the budget being edited
  const [editingBudget, setEditingBudget] = useState(null);

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

  const formatCpfCnpj = (value) => {
    const cleanedValue = value.replace(/\D/g, '');
    const length = cleanedValue.length;

    if (length === 11) {
      return cleanedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (length === 14) {
      return cleanedValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } else {
      return value;
    }
  };

  useEffect(() => {
    if (budgetId) {
      const budgetToEdit = budgets.find(budget => budget.id === parseInt(budgetId, 10));
      if (budgetToEdit) {
        setEditingBudget(budgetToEdit);
        setSelectedClient({ id: budgetToEdit.customerName, name: budgetToEdit.customerName }); // Assuming customerName is the ID
        setAddedProducts(budgetToEdit.items.filter(item => item.type === 'product'));
        setAddedAccessories(budgetToEdit.items.filter(item => item.type === 'accessory'));
        setObservation(budgetToEdit.observation || '');
      }
    }
  }, [budgetId, budgets]);

  // Client handlers
  const handleClientSelect = (e) => {
    if (e.target.value === 'new') {
      setShowNewCustomerForm(true);
      setSelectedClient(null);
    } else {
      setShowNewCustomerForm(false);
      const client = customers.find(c => c.id === parseInt(e.target.value));
      setSelectedClient(client);
    }
  };

  const handleNewCustomerSubmit = (e) => {
    e.preventDefault();
    const newId = customers.length + 1;
    const customerToAdd = { ...newCustomer, id: newId };
    setCustomers([...customers, customerToAdd]);
    setSelectedClient(customerToAdd);
    setShowNewCustomerForm(false);
    setNewCustomer({ cpfCnpj: '', name: '', address: '', phone: '' });
  };

  const handleNewCustomerCpfCnpjChange = (e) => {
    let value = e.target.value;
    value = formatCpfCnpj(value);
    setNewCustomer({ ...newCustomer, cpfCnpj: value });
  };

  // Product handlers
  const handleProductSelect = (e) => {
    const product = products.find(p => p.id === parseInt(e.target.value));
    setSelectedProduct(product);
    setLength('');
    setHeight('');
  };

  const handleAddProduct = () => {
    if (!selectedProduct || !length) {
      alert('Selecione um produto e informe a largura');
      return;
    }

    const isWaveModel = selectedProduct && selectedProduct.model ? selectedProduct.model.toLowerCase() === 'wave' : false;
    if (!isWaveModel && !height) {
      alert('Informe a altura do produto');
      return;
    }

    const price = isWaveModel 
      ? selectedProduct.salePrice * length
      : selectedProduct.salePrice * length * height;

    const productToAdd = {
      ...selectedProduct,
      length: parseFloat(length),
      height: isWaveModel ? null : parseFloat(height),
      price,
      hasBando: false, // Initialize bando to false for each product
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

  const handleEditProduct = (index) => {
    setEditingProductId(index);
    const productToEdit = addedProducts[index];
    setSelectedProduct(productToEdit);
    setLength(productToEdit.length);
    setHeight(productToEdit.height);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...addedProducts];
    updatedProducts.splice(index, 1);
    setAddedProducts(updatedProducts);
  };

  const handleBandoChange = (index) => {
    const updatedProducts = [...addedProducts];
    updatedProducts[index].hasBando = !updatedProducts[index].hasBando;
    setAddedProducts(updatedProducts);
  };

  // Installation price calculation
  const updateInstallationPrice = (products) => {
    setInstallationPrice(products.length * 150);
  };

  // Accessory handlers
  const handleAccessorySelect = (e) => {
    const accessory = accessories.find(a => a.id === parseInt(e.target.value));
    setSelectedAccessory(accessory);
  };

  const handleAddAccessory = () => {
    if (!selectedAccessory) return;
    setAddedAccessories([...addedAccessories, selectedAccessory]);
    setSelectedAccessory(null);
  };

  // Calculate total
  const calculateTotal = () => {
    let productsTotal = 0;
    addedProducts.forEach(product => {
      productsTotal += product.price;
      if (product.hasBando) {
        productsTotal += product.length * 120; // Bando price calculation
      }
    });
    const accessoriesTotal = addedAccessories.reduce((sum, a) => sum + a.price, 0);
    return productsTotal + accessoriesTotal + installationPrice;
  };

  // Finalize budget
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
      id: budgetId ? parseInt(budgetId, 10) : budgets.length + 1,
      customerName: selectedClient.name,
      items: [...addedProducts, ...addedAccessories],
      installationPrice,
      observation,
      totalValue: calculateTotal(),
      status: 'pendente',
      creationDate: new Date().toISOString()
    };

    if (budgetId) {
      // Update existing budget
      const updatedBudgets = budgets.map(budget =>
        budget.id === parseInt(budgetId, 10) ? newBudget : budget
      );
      setBudgets(updatedBudgets);
    } else {
      // Add new budget
      setBudgets([...budgets, newBudget]);
    }
    navigate('/budgets');
  };

  return (
    <div className="budget-form">
      {/* Client Section */}
      <section className="section">
        <h2>Cliente</h2>
        <select onChange={handleClientSelect} value={selectedClient?.id || ''}>
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
              placeholder="CPF/CNPJ"
              value={newCustomer.cpfCnpj}
              onChange={handleNewCustomerCpfCnpjChange}
              maxLength="18"
            />
            <input
              type="text"
              placeholder="Nome"
              value={newCustomer.name}
              onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
              required
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
              {product.name} - {product.model}
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
            />
            {selectedProduct && selectedProduct.model && selectedProduct.model.toLowerCase() !== 'wave' && (
              <input
                type="number"
                placeholder="Altura"
                value={height}
                onChange={e => setHeight(e.target.value)}
              />
            )}
            <button onClick={handleAddProduct}>{editingProductId !== null ? 'Atualizar Produto' : 'Adicionar Produto'}</button>
          </div>
        )}

        {addedProducts.length > 0 && (
          <div className="added-products">
            <h3>Produtos Adicionados:</h3>
            <ul>
              {addedProducts.map((product, index) => (
                <li key={index}>
                  {product.name} - L: {product.length}
                  {product.height ? ` x A: ${product.height}` : ''} - 
                  R$ {product.price.toFixed(2)}
                  <label>
                    <input
                      type="checkbox"
                      checked={product.hasBando}
                      onChange={() => handleBandoChange(index)}
                    />
                    Bando (R$ {(product.length * 120).toFixed(2)})
                  </label>
                  <button onClick={() => handleEditProduct(index)}>Editar</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Installation Section */}
      <section className="section">
        <h2>Instalação</h2>
        <p>Valor da Instalação: R$ {installationPrice.toFixed(2)}</p>
      </section>

      {/* Accessories Section */}
      <section className="section">
        <h2>Acessórios</h2>
        <select onChange={handleAccessorySelect} value={selectedAccessory?.id || ''}>
          <option value="">Selecione um acessório</option>
          {accessories.map(accessory => (
            <option key={accessory.id} value={accessory.id}>
              {accessory.name} - R$ {accessory.price.toFixed(2)}
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
                  {accessory.name} - R$ {accessory.price.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
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
        <h2>Total do Orçamento: R$ {calculateTotal().toFixed(2)}</h2>
      </section>

      {/* Finalize Button */}
      <button className="finalize-button" onClick={handleFinalize}>
        {budgetId ? 'Atualizar Orçamento' : 'Concluir Orçamento'}
      </button>
    </div>
  );
}

export default Budgets;
