import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import jspdf-autotable
import Accessories from './Accessories';
import { Link } from 'react-router-dom';

function Budgets({ customers, products, paymentMethods, accessories, setCustomers }) {
  const [customer, setCustomer] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [taxes, setTaxes] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [newTax, setNewTax] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [budgetStatusFilter, setBudgetStatusFilter] = useState('pending');
  const [budgets, setBudgets] = useState([
    { id: 1, customerName: 'Client A', status: 'pending', totalValue: 1500.00 },
    { id: 2, customerName: 'Client B', status: 'finalized', totalValue: 2200.50 },
    { id: 3, customerName: 'Client C', status: 'pending', totalValue: 850.20 },
  ]);

  // --- Customer Form State ---
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  const handleInputChange = (e) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCustomer.name.trim()) {
      alert('Nome do cliente é obrigatório.');
      return;
    }

    let updatedCustomers;
    if (editingCustomerId) {
      updatedCustomers = customers.map(c =>
        c.id === editingCustomerId ? { ...c, ...newCustomer, id: editingCustomerId } : c
      );
      setEditingCustomerId(null);
    } else {
      const nextId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
      updatedCustomers = [...customers, { ...newCustomer, id: nextId }];
    }

    console.log('handleSubmit - updatedCustomers:', updatedCustomers); // DEBUG
    setCustomers(updatedCustomers);
    console.log('handleSubmit - customers after setCustomers:', customers); // DEBUG
    setCustomer(newCustomer.name); // Update selected customer after adding/editing
    setNewCustomer({ name: '', phone: '', email: '', address: '' });
    setShowNewCustomerForm(false);
  };

  const handleEditCustomer = (id) => {
    const customerToEdit = customers.find(customer => customer.id === id);
    if (customerToEdit) {
      setNewCustomer({
        name: customerToEdit.name,
        phone: customerToEdit.phone,
        email: customerToEdit.email,
        address: customerToEdit.address,
      });
      setEditingCustomerId(id);
      setShowNewCustomerForm(true);
    }
  };

  const handleDeleteCustomer = (id) => {
    // const updatedCustomers = customers.filter(customer => customer.id !== id); // Don't update here
    // setCustomers(updatedCustomers);
  };

  const handleCancelEdit = () => {
    setNewCustomer({ name: '', phone: '', email: '', address: '' });
    setEditingCustomerId(null);
    setShowNewCustomerForm(false);
  };

  // --- End Customer Form Logic ---

  // --- Product Selection State ---
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantities, setProductQuantities] = useState({});
  const [productDimensions, setProductDimensions] = useState({});

  const handleProductSelection = (e) => {
    const productId = parseInt(e.target.value);
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);

    if (!productQuantities[productId]) {
      setProductQuantities(prev => ({ ...prev, [productId]: 1 }));
    }
    if (!productDimensions[productId]) {
      setProductDimensions(prev => ({
        ...prev,
        [productId]: {
          height: 0,
          width: 0,
          length: product?.length || 0,
        }
      }));
    }
  };

  const handleAddSelectedProduct = () => {
    if (selectedProduct) {
      if (!selectedProducts.some(p => p.id === selectedProduct.id)) {
        setSelectedProducts([...selectedProducts, selectedProduct]);
      }
      setSelectedProduct(null);
    }
  };

  const handleRemoveSelectedProduct = (id) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
    const { [id]: _, ...restQuantities } = productQuantities;
    setProductQuantities(restQuantities);
    const { [id]: __, ...restDimensions } = productDimensions;
    setProductDimensions(restDimensions);
  };

  const handleQuantityChange = (productId, quantity) => {
    setProductQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const handleDimensionChange = (productId, dimension, value) => {
    setProductDimensions(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [dimension]: parseFloat(value) || 0 }
    }));
  };

  // --- End Product Selection State ---

  // --- Accessories Selection ---
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [selectedAccessory, setSelectedAccessory] = useState(null);
  const [accessoryQuantities, setAccessoryQuantities] = useState({});

  const handleAccessorySelection = (e) => {
    const accessoryId = parseInt(e.target.value);
    const accessory = accessories.find((a) => a.id === accessoryId);
    setSelectedAccessory(accessory);

    if(!accessoryQuantities[accessoryId]) {
      setAccessoryQuantities(prev => ({...prev, [accessoryId]: 1}));
    }
  };

  const handleAddSelectedAccessory = () => {
      if(selectedAccessory) {
          if(!selectedAccessories.some(a => a.id === selectedAccessory.id)) {
              setSelectedAccessories([...selectedAccessories, selectedAccessory]);
          }
          setSelectedAccessory(null);
      }
  };

  const handleRemoveSelectedAccessory = (id) => {
      setSelectedAccessories(selectedAccessories.filter(a => a.id !== id));
      const { [id]: _, ...restQuantities} = accessoryQuantities;
      setAccessoryQuantities(restQuantities);
  };

  const handleAccessoryQuantityChange = (accessoryId, quantity) => {
      setAccessoryQuantities(prev => ({...prev, [accessoryId]: quantity}));
  };

  // --- End Accessories Selection ---


  const calculateTotalPrice = () => {
    let totalPrice = 0;

    // Calculate product prices
    selectedProducts.forEach(product => {
      const quantity = productQuantities[product.id] || 1;
      const dimensions = productDimensions[product.id] || { height: 0, width: 0, length: 0 };
      let productPrice = 0;

      const isLengthCalculationForced = ['WAVE', 'ROMANA', 'ROLO'].includes(product.model.toUpperCase());

      if (isLengthCalculationForced || product.calculationMethod === 'Comprimento') {
        productPrice = (product.salePrice / product.length) * dimensions.length * quantity;
      } else { // Assume 'm2'
        productPrice = (product.salePrice / (product.length * 1)) * dimensions.length * dimensions.height * quantity;
      }
      totalPrice += productPrice;
    });

    // Add accessories prices
    selectedAccessories.forEach(accessory => {
        const quantity = accessoryQuantities[accessory.id] || 1;
        totalPrice += accessory.price * quantity;
    });

    return totalPrice;
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let currentY = margin;

    // Function to add text with styling
    const addStyledText = (text, x, y, fontStyle = 'normal', fontSize = 12, align = 'left', textColor = '#000000') => {
      doc.setFont('helvetica', fontStyle);
      doc.setFontSize(fontSize);
      doc.setTextColor(textColor);
      doc.text(text, x, y, { align: align });
    };

    // Function to draw a line
    const drawLine = (startY, endY, startX = margin, endX = pageWidth - margin, color = '#CCCCCC', lineWidth = 0.5) => {
      doc.setDrawColor(color);
      doc.setLineWidth(lineWidth);
      doc.line(startX, startY, endX, endY);
    };


    // Header rectangle
    doc.setFillColor('#004A94'); // Dark blue color
    doc.rect(0, 0, pageWidth, 30, 'F');
    addStyledText('Orçamento', margin, 20, 'bold', 20, 'left', '#FFFFFF');
    addStyledText('Pintura Residencial', margin, 26, 'normal', 12, 'left', '#FFFFFF');

    // Date on the right
    const currentDate = new Date().toLocaleDateString('pt-BR');
    addStyledText(currentDate, pageWidth - margin, 20, 'normal', 10, 'right', '#FFFFFF');
    currentY = 40;

    // Proposal title
    addStyledText(`Proposta para pintura residencial para a Cliente ${customer}`, margin, currentY, 'bold', 14);
    currentY += 15;

    // Service and Value table
    let tableData = [];
    selectedProducts.forEach(product => {
      const quantity = productQuantities[product.id] || 1;
      const dimensions = productDimensions[product.id] || { height: 0, width: 0, length: 0 };
      let productPrice = 0;
      const isLengthCalculationForced = ['WAVE', 'ROMANA', 'ROLO'].includes(product.model.toUpperCase());
      if (isLengthCalculationForced || product.calculationMethod === 'Comprimento') {
        productPrice = (product.salePrice / product.length) * dimensions.length * quantity;
      } else { // Assume 'm2'
        productPrice = (product.salePrice / (product.length * 1)) * dimensions.length * dimensions.height * quantity;
      }
      let serviceDescription = `${product.product} - ${product.model} - ${product.material} - ${product.name} - ${product.code} (Quantidade: ${quantity})`;
      if(product.calculationMethod === "Comprimento") {
        serviceDescription += ` - Comprimento: ${dimensions.length}m`;
      } else {
        serviceDescription += ` - Altura: ${dimensions.height}m, Largura: ${dimensions.width}m`;
      }
      tableData.push([serviceDescription, `R$ ${productPrice.toFixed(2)}`]);
    });

    selectedAccessories.forEach(accessory => {
        const quantity = accessoryQuantities[accessory.id] || 1;
        tableData.push([`${accessory.name} (Quantidade: ${quantity})`, `R$ ${accessory.price.toFixed(2)}`]);
    });


    if (tableData.length > 0) {
      doc.autoTable({
        startY: currentY,
        head: [['Serviço', 'VALOR']],
        body: tableData,
        styles: {
          head заливка: { fillColor: '#D3D3D3', textColor: '#000000', fontStyle: 'bold' },
          body: { fillColor: '#FFFFFF', textColor: '#000000' },
           головнойRowHeight: 20,
          rowHeight: 15,
          fontSize: 10,
          padding: 5,
          columnStyles: { 1: { halign: 'right' } } // Align 'VALOR' column to the right
        }
      });
      currentY = doc.autoTable.previous.finalY + 10;
    }


    // Total price
    const totalPrice = calculateTotalPrice();
    addStyledText(`Preço Total: R$ ${totalPrice.toFixed(2)}`, margin, currentY, 'bold', 14);
    currentY += 15;
    drawLine(currentY, currentY);
    currentY += 10;


    // Notes section
    addStyledText('• O prazo para finalização dos serviços é de 15 dias úteis.', margin, currentY, 'normal', 10);
    currentY += 5;
    addStyledText('• Aceitamos parcelamento dos valores em cartão.', margin, currentY, 'normal', 10);
    currentY += 5;
    addStyledText('• Para início do trabalho recebemos 20% do valor antecipado.', margin, currentY, 'normal', 10);
    currentY += 5;
    addStyledText('• Este orçamento tem validade de 20 dias corridos.', margin, currentY, 'normal', 10);
    currentY += 10;

    // Contact information and company name - Simplified
    drawLine(currentY, currentY);
    currentY += 10;
    addStyledText('(12)3456-7890', margin, currentY, 'normal', 10);
    currentY += 5;
    addStyledText('ola@grandesite.com.br', margin, currentY, 'normal', 10);
    currentY += 5;
    addStyledText('@grandesite', margin, currentY, 'normal', 10);
    currentY += 10;
    addStyledText('Hélio Russo', margin, currentY, 'bold', 12);
    currentY += 5;
    addStyledText('Pintor Residencial', margin, currentY, 'normal', 10);


    doc.save('orcamento_persifix.pdf');
  };

  const finalizeBudget = () => {
    alert('Orçamento Finalizado');
    // Update budget status to 'finalized' - Implementation needed
  };

  const activateBudget = () => {
    alert('Orçamento Efetivado');
    // Update budget status to 'activated' - Implementation needed
  };

  const filteredBudgets = budgetStatusFilter === 'all'
    ? budgets
    : budgets.filter(budget => budget.status === budgetStatusFilter);


  return (
    <div>
      <h2>Orçamentos</h2>

      {/* Budget Status Submenu Link */}
      <div>
        <Link to="/budgets-status">Verificar Status do Orçamento</Link>
      </div>

      {/* Customer Selection */}
      <h3>Selecionar Cliente</h3>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <select value={customer} onChange={(e) => setCustomer(e.target.value)}>
          <option value="">Selecione um cliente</option>
          {customers.map((cust) => (
            <option key={cust.id} value={cust.name}>{cust.name}</option>
          ))}
        </select>
        <button onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}>+</button>
      </div>

      {/* New Customer Form */}
      {showNewCustomerForm && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome:</label>
            <input type="text" id="name" name="name" value={newCustomer.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Telefone:</label>
            <input type="tel" id="phone" name="phone" value={newCustomer.phone} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={newCustomer.email} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="address">Endereço:</label>
            <input type="text" id="address" name="address" value={newCustomer.address} onChange={handleInputChange} />
          </div>
          <div className="form-actions">
            <button type="submit">{editingCustomerId ? 'Salvar Edição' : 'Adicionar Cliente'}</button>
            {editingCustomerId && <button type="button" onClick={handleCancelEdit}>Cancelar Edição</button>}
          </div>
        </form>
      )}

      {/* Product Selection */}
      <h3>Selecionar Produtos</h3>
      <div className="form-group">
        <label>Produto:</label>
        <select value={selectedProduct ? selectedProduct.id : ''} onChange={handleProductSelection}>
          <option value="">Selecione um Produto</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.product} - {product.model} - {product.material} - {product.name} - {product.code} - Preço: {product.salePrice}
            </option>
          ))}
        </select>
        <button type="button" onClick={handleAddSelectedProduct}>Adicionar Produto</button>
      </div>
      <ul className="product-list">
        {selectedProducts.map(product => (
          <li key={product.id} className="product-item">
            {product.product} - {product.model} - {product.material} - {product.name} - {product.code} - Preço: {product.salePrice}
            <div className="product-actions">
              <input
                type="number"
                min="1"
                value={productQuantities[product.id] || 1}
                onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
              />
              {product.calculationMethod === 'Comprimento' ? (
                <input
                  type="number"
                  placeholder="Comprimento"
                  value={productDimensions[product.id]?.length || 0}
                  onChange={(e) => handleDimensionChange(product.id, 'length', e.target.value)}
                />
              ) : (
                <>
                  <input
                    type="number"
                    placeholder="Altura"
                    value={productDimensions[product.id]?.height || 0}
                    onChange={(e) => handleDimensionChange(product.id, 'height', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Largura"
                    value={productDimensions[product.id]?.width || 0}
                    onChange={(e) => handleDimensionChange(product.id, 'width', e.target.value)}
                  />
                </>
              )}
              <button type="button" onClick={() => handleRemoveSelectedProduct(product.id)}>Remover</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Accessory Selection */}
            <h3>Selecionar Acessórios</h3>
            <div className="form-group">
                <label>Acessório:</label>
                <select value={selectedAccessory?.id || ''} onChange={handleAccessorySelection}>
                    <option value="">Selecione um Acessório</option>
                    {accessories && accessories.length > 0 ? (
                        accessories.map(accessory => (
                            <option key={accessory.id} value={accessory.id}>
                                {accessory.name} - R$ {accessory.price.toFixed(2)}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>Nenhum acessório disponível</option>
                    )}
                </select>
                <button type="button" onClick={handleAddSelectedAccessory}>Adicionar Acessório</button>
            </div>
            <ul className='accessory-list'>
                {selectedAccessories.map(accessory => (
                    <li key={accessory.id} className="accessory-item">
                        {accessory.name} - R$ {accessory.price.toFixed(2)}
                        <div className="accessory-actions">
                            <input
                                type="number"
                                min="1"
                                value={accessoryQuantities[accessory.id] || 1}
                                onChange={(e) => handleAccessoryQuantityChange(accessory.id, parseInt(e.target.value))}
                            />
                            <button type="button" onClick={() => handleRemoveSelectedAccessory(accessory.id)}>Remover</button>
                        </div>
                    </li>
                ))}
            </ul>

      {/* Payment Method Selection */}
      <div className="form-group">
        <label>Forma de Pagamento</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="">Selecione uma forma de pagamento</option>
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.name}>{method.name}</option>
          ))}
        </select>
      </div>

      {/* Display Total Price */}
      <div>
        <h3>Preço Total: R$ {calculateTotalPrice().toFixed(2)}</h3>
      </div>

      {/* Actions */}
      <button onClick={generatePDF}>Gerar PDF</button>
      <button onClick={finalizeBudget}>Finalizar Orçamento</button>
      <button onClick={activateBudget}>Efetivar Orçamento</button>
    </div>
  );
}

export default Budgets;
