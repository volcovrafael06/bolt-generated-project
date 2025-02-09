import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Budgets.css'; // Import CSS file for styling

function Budgets({ customers, products, setCustomers }) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [length, setLength] = useState(0);
  const [height, setHeight] = useState(0);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const handleClientSelect = (event) => {
    if (event.target.value === 'new-customer') {
      setShowNewCustomerForm(true);
      setSelectedClient(null);
    } else {
      setShowNewCustomerForm(false);
      setSelectedClient(customers.find(client => client.id === event.target.value));
    }
  };

  const handleProductSelect = (event) => {
    const selectedProductId = parseInt(event.target.value, 10);
    setSelectedProduct(products.find(product => product.id === selectedProductId));
  };

  const handleLengthChange = (event) => {
    setLength(parseFloat(event.target.value));
  };

  const handleHeightChange = (event) => {
    setHeight(parseFloat(event.target.value));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const tableData = [
      [ 'Cliente', 'Produto', 'Comprimento', 'Altura' ],
      [ selectedClient?.name || '', selectedProduct?.name || '', length, height ],
    ];
    doc.autoTable({ html: '#my-table' });
    doc.save('budget.pdf');
  };

  const handleNewCustomerInputChange = (e) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
  };

  const handleAddNewCustomer = (e) => {
    e.preventDefault();
    if (!newCustomer.name.trim()) {
      alert('Nome do cliente é obrigatório.');
      return;
    }
    const nextCustomerId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    const updatedCustomers = [...customers, { ...newCustomer, id: nextCustomerId }];
    setCustomers(updatedCustomers);
    setSelectedClient({ ...newCustomer, id: nextCustomerId }); // Select the new customer
    setShowNewCustomerForm(false); // Hide the new customer form
    setNewCustomer({ name: '', phone: '', email: '', address: '' }); // Clear the form
  };


  return (
    <div className="budgets-container">
      <div className="client-section">
        <h2>Cliente</h2>
        <select value={selectedClient?.id || ''} onChange={handleClientSelect}>
          <option value="new-customer">+ Novo Cliente</option>
          <option value="">Selecione um Cliente</option>
          {customers.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>

        {showNewCustomerForm && (
          <div className="new-client-form">
            <h3>Novo Cliente</h3>
            <form onSubmit={handleAddNewCustomer}>
              <div className="form-group">
                <label htmlFor="name">Nome:</label>
                <input type="text" id="name" name="name" value={newCustomer.name} onChange={handleNewCustomerInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Telefone:</label>
                <input type="tel" id="phone" name="phone" value={newCustomer.phone} onChange={handleNewCustomerInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={newCustomer.email} onChange={handleNewCustomerInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="address">Endereço:</label>
                <input type="text" id="address" name="address" value={newCustomer.address} onChange={handleNewCustomerInputChange} />
              </div>
              <div className="form-actions">
                <button type="submit">Adicionar Cliente</button>
                <button type="button" onClick={() => setShowNewCustomerForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        )}
      </div>
      <div className="product-section">
        <h2>Produto</h2>
        <select value={selectedProduct?.id || ''} onChange={handleProductSelect}>
          <option value="">Selecione um Produto</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} - {product.model} - {product.material} - {product.code}
            </option>
          ))}
        </select>
        {selectedProduct && (
          <div>
            <p>Detalhes do Produto:</p>
            <p>Nome: {selectedProduct.name}</p>
            <p>Modelo: {selectedProduct.model}</p>
            <p>Material: {selectedProduct.material}</p>
            <p>Código: {selectedProduct.code}</p>
            <p>Preço de Venda: {selectedProduct.salePrice}</p>
            <label>Comprimento:</label>
            <input type="number" value={length} onChange={handleLengthChange} />
            {selectedProduct.model !== 'WAVE' && (
              <>
                <label>Altura:</label>
                <input type="number" value={height} onChange={handleHeightChange} />
              </>
            )}
          </div>
        )}
      </div>
      <button onClick={generatePDF}>Gerar PDF</button>
    </div>
  );
}

export default Budgets;
