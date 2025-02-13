
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Budgets.css';

function Budgets({ customers, products, accessories, setCustomers, setBudgets, budgets }) {
  const navigate = useNavigate();
  const { budgetId } = useParams();

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

  useEffect(() => {
    if (budgetId) {
      const budgetToEdit = budgets.find(budget => budget.id === parseInt(budgetId, 10));
      if (budgetToEdit) {
        setEditingBudget(budgetToEdit);
        const customer = customers.find(c => c.name === budgetToEdit.customerName);
        setSelectedClient(customer || null);
        setAddedProducts(budgetToEdit.items?.filter(item => item.type === 'product') || []);
        setAddedAccessories(budgetToEdit.items?.filter(item => item.type === 'accessory') || []);
        setObservation(budgetToEdit.observation || '');
      }
    }
  }, [budgetId, budgets, customers]);

  const handleProductSelect = (e) => {
    const productId = parseInt(e.target.value, 10);
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setLength('');
    setHeight('');
  };

  const handleAddProduct = () => {
    if (!selectedProduct || !length) {
      alert('Selecione um produto e informe a largura');
      return;
    }

    const isWaveModel = selectedProduct.model?.toLowerCase() === 'wave';
    if (!isWaveModel && !height) {
      alert('Informe a altura do produto');
      return;
    }

    const price = isWaveModel 
      ? selectedProduct.salePrice * parseFloat(length)
      : selectedProduct.salePrice * parseFloat(length) * parseFloat(height);

    const productToAdd = {
      type: 'product',
      item: selectedProduct,
      length: parseFloat(length),
      height: isWaveModel ? null : parseFloat(height),
      price: price || 0,
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

  const handleBandoChange = (index) => {
    const updatedProducts = [...addedProducts];
    const product = updatedProducts[index];
    product.hasBando = !product.hasBando;
    
    // Recalculate price with bando
    if (product.hasBando) {
      product.price += product.length * 120; // Add bando price
    } else {
      product.price -= product.length * 120; // Remove bando price
    }
    
    setAddedProducts(updatedProducts);
  };

  const handleEditProduct = (index) => {
    const productToEdit = addedProducts[index];
    setSelectedProduct(productToEdit.item);
    setLength(productToEdit.length.toString());
    setHeight(productToEdit.height?.toString() || '');
    setEditingProductId(index);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...addedProducts];
    updatedProducts.splice(index, 1);
    setAddedProducts(updatedProducts);
    updateInstallationPrice(updatedProducts);
  };

  const updateInstallationPrice = (products) => {
    setInstallationPrice(products.length * 150);
  };

  const calculateTotal = () => {
    const productsTotal = addedProducts.reduce((sum, product) => sum + (product.price || 0), 0);
    const accessoriesTotal = addedAccessories.reduce((sum, acc) => sum + (acc.price || 0), 0);
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
      setBudgets(budgets.map(budget => 
        budget.id === parseInt(budgetId, 10) ? newBudget : budget
      ));
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
        <select 
          onChange={(e) => {
            if (e.target.value === 'new') {
              setShowNewCustomerForm(true);
              setSelectedClient(null);
            } else {
              setShowNewCustomerForm(false);
              const client = customers.find(c => c.id === parseInt(e.target.value, 10));
              setSelectedClient(client || null);
            }
          }} 
          value={selectedClient?.id || ''}
        >
          <option value="">Selecione um cliente</option>
          <option value="new">+