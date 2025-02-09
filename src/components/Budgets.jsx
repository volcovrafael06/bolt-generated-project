import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Budgets.css'; // Import CSS file for styling

function Budgets({ customers, products, accessories, setCustomers, setBudgets, budgets }) { // Recebendo budgets como prop
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAccessory, setSelectedAccessory] = useState(null);
  const [length, setLength] = useState(0);
  const [height, setHeight] = useState(0);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [budgetItems, setBudgetItems] = useState([]);

  const handleClientSelect = (event) => {
    if (event.target.value === 'new-customer') {
      setShowNewCustomerForm(true);
      setSelectedClient(null);
    } else if (event.target.value) {
      setShowNewCustomerForm(false);
      setSelectedClient(customers.find(client => client.id === parseInt(event.target.value, 10)));
    } else {
      setSelectedClient(null);
      setShowNewCustomerForm(false);
    }
  };

  const handleProductSelect = (event) => {
    const selectedProductId = parseInt(event.target.value, 10);
    setSelectedProduct(products.find(product => product.id === selectedProductId));
  };

  const handleAccessorySelect = (event) => {
    const selectedAccessoryId = parseInt(event.target.value, 10);
    setSelectedAccessory(accessories.find(accessory => accessory.id === selectedAccessoryId));
  };

  const handleLengthChange = (event) => {
    setLength(parseFloat(event.target.value));
  };

  const handleHeightChange = (event) => {
    setHeight(parseFloat(event.target.value));
  };

  const handleAddItemToBudget = () => {
    let newItem = null;

    if (selectedProduct) {
      let calculatedPrice = selectedProduct.salePrice;
      if (selectedProduct.calculationMethod === 'm2') {
        calculatedPrice = length * height * selectedProduct.salePrice;
      }

      if (typeof calculatedPrice !== 'number') {
        calculatedPrice = 0;
      }

      newItem = {
        type: 'product',
        item: selectedProduct,
        length: length,
        height: height,
        price: calculatedPrice,
      };
      setSelectedProduct(null);
      setLength(0);
      setHeight(0);

    } else if (selectedAccessory) {
      newItem = {
        type: 'accessory',
        item: selectedAccessory,
        price: selectedAccessory.price,
      };
      setSelectedAccessory(null);
    } else {
      alert('Selecione um produto ou acessório para adicionar ao orçamento.');
      return;
    }

    if (newItem) {
      setBudgetItems([...budgetItems, newItem]);
    }
  };


  const generatePDF = () => {
    const doc = new jsPDF();
    const tableData = [
      ['Item', 'Detalhes', 'Preço'],
      ...budgetItems.map(budgetItem => {
        if (budgetItem.type === 'product') {
          return [
            budgetItem.item.name,
            `Modelo: ${budgetItem.item.model}, Comprimento: ${budgetItem.length}, Altura: ${budgetItem.height}`,
            budgetItem.price ? budgetItem.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'
          ];
        } else if (budgetItem.type === 'accessory') {
          return [
            budgetItem.item.name,
            'Acessório',
            budgetItem.price ? budgetItem.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'
          ];
        }
        return [];
      })
    ];
    doc.text(`Cliente: ${selectedClient?.name || 'Nenhum cliente selecionado'}`, 10, 10);
    doc.autoTable({ head: [tableData[0]], body: tableData.slice(1) });
    doc.save('budget.pdf');
  };

  const handleFinalizeBudget = () => {
    // Criar um novo objeto de orçamento
    const newBudget = {
      id: budgets.length + 1, // Simple ID generation for now
      customerName: selectedClient ? selectedClient.name : 'Novo Cliente', // Use selected client name or 'Novo Cliente' if new
      totalValue: budgetItems.reduce((total, item) => total + item.price, 0), // Sum up prices of all items
      creationDate: new Date(),
      status: 'pendente', // Set status to 'pendente'
      items: budgetItems, // Save budget items
    };

    // Atualizar a lista de orçamentos no estado do App
    setBudgets([...budgets, newBudget]);

    alert('Orçamento finalizado e status definido como "pendente".');
    // Em um futuro próximo, você precisará implementar a lógica para salvar os dados do orçamento
    // e atualizar o estado da aplicação para refletir o orçamento pendente.
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
    setSelectedClient({ ...newCustomer, id: nextCustomerId });
    setShowNewCustomerForm(false);
    setNewCustomer({ name: '', phone: '', email: '', address: '' });
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
            <p>Preço: {selectedProduct.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <label>Comprimento:</label>
            <input type="number" value={length} onChange={handleLengthChange} />
            {selectedProduct.model.toLowerCase() !== 'wave' && (
              <>
                <label>Altura:</label>
                <input type="number" value={height} onChange={handleHeightChange} />
              </>
            )}
             <button type="button" onClick={handleAddItemToBudget}>Adicionar Produto</button>
          </div>
        )}
      <div className="accessories-section">
          <h2>Acessórios</h2>
          <select value={selectedAccessory?.id || ''} onChange={handleAccessorySelect}>
            <option value="">Selecione um Acessório</option>
            {accessories.map(accessory => (
              <option key={accessory.id} value={accessory.id}>
                {accessory.name} - R$ {accessory.price.toFixed(2)}
              </option>
            ))}
          </select>
          {selectedAccessory && (
            <div>
              <p>Detalhes do Acessório:</p>
              <p>Nome: {selectedAccessory.name}</p>
              <p>Preço: R$ {selectedAccessory.price.toFixed(2)}</p>
              <button type="button" onClick={handleAddItemToBudget}>Adicionar Acessório</button>
            </div>
          )}
        </div>
      </div>


      {/* Display Budget Items */}
      <div className="budget-items-section">
        <h3>Itens do Orçamento</h3>
        {budgetItems.length > 0 ? (
          <ul>
            {budgetItems.map((item, index) => (
              <li key={index}>
                {item.type === 'product' ? (
                  `${item.item.name} - ${item.item.model} - Comprimento: ${item.length} - Altura: ${item.height} - Preço: ${item.price ? item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}`
                ) : (
                  `${item.item.name} - Acessório - Preço: ${item.price ? item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}`
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum item adicionado ao orçamento.</p>
        )}
      </div>

      <button onClick={generatePDF}>Gerar PDF</button>
      <button onClick={handleFinalizeBudget}>Finalizar Orçamento</button> {/* Botão "Finalizar Orçamento" adicionado */}
    </div>
  );
}

export default Budgets;
