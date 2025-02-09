import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Budgets.css'; // Import CSS file for styling

function Budgets({ customers, products, accessories, setCustomers, setBudgets, budgets, companyLogo }) { // Recebendo budgets como prop e companyLogo
  console.log("Budgets component - typeof setBudgets:", typeof setBudgets); // Debug log
  const { budgetId } = useParams(); // Get budgetId from URL params
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
  const [isBudgetFinalized, setIsBudgetFinalized] = useState(false); // New state variable
  const [finalizedBudget, setFinalizedBudget] = useState(null); // New state for finalized budget

  useEffect(() => {
    if (budgetId) {
      const budgetToEdit = budgets.find(budget => budget.id === parseInt(budgetId, 10));
      if (budgetToEdit) {
        // Pre-populate form with budget data
        setSelectedClient(customers.find(c => c.name === budgetToEdit.customerName) || null); // Assuming customer name is stored
        setBudgetItems(budgetToEdit.items);
        // You might need to pre-select products and accessories in dropdowns if needed
        // based on budgetToEdit.items, but it's complex as dropdowns are for single selection.
        // For now, budget items are loaded, client is selected.
      }
    }
  }, [budgetId, budgets, customers]);


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

    // Company Logo and Header
    if (companyLogo) {
      const imgData = URL.createObjectURL(companyLogo);
      doc.addImage(imgData, 'JPEG', 10, 10, 50, 15); // Adjust position and size as needed
    }
    doc.setFontSize(12);
    doc.text('PersiFIX Sistemas', 10, 30); // Company Name - adjust position
    doc.setFontSize(10);
    doc.text('Tel.: (XX) XXXX-XXXX', 10, 35); // Company Phone - adjust position
    doc.text('WhatsApp: (XX) XXXXX-XXXX', 10, 40); // Company WhatsApp - adjust position
    doc.text('Email: email@persifix.com', 10, 45); // Company Email - adjust position

    // Budget Title
    doc.setFontSize(16);
    doc.text('Orçamento', 80, 30); // Budget Title - adjust position

    // Budget Number and Date
    const budgetNumber = budgets.length + 1; // Simple budget number - improve logic later
    const creationDate = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.text(`Orçamento Nº: ${budgetNumber}`, 150, 15); // Budget Number - adjust position
    doc.text(`Criado em: ${creationDate}`, 150, 20); // Creation Date - adjust position


    // Client Information
    doc.setFontSize(12);
    doc.text('Cliente:', 10, 60); // Client Label - adjust position
    doc.setFontSize(10);
    doc.text(`Nome: ${selectedClient?.name || 'N/A'}`, 10, 65);
    doc.text(`Telefone: ${selectedClient?.phone || 'N/A'}`, 10, 70);
    doc.text(`Email: ${selectedClient?.email || 'N/A'}`, 10, 75);
    doc.text(`Endereço: ${selectedClient?.address || 'N/A'}`, 10, 80);

    // Items Table
    const tableColumn = ["Código", "Descrição", "Qtd", "Preço Unit.", "Total"];
    const tableRows = [];

    budgetItems.forEach((budgetItem, index) => {
      let description = '';
      let code = '';
      let quantity = '';
      let unitPrice = 0;

      if (budgetItem.type === 'product') {
        description = `${budgetItem.item.name} - ${budgetItem.item.model}`;
        code = budgetItem.item.code;
        quantity = (budgetItem.item.calculationMethod === 'm2') ? `${budgetItem.length} x ${budgetItem.height} m²` : '1'; // Adjust quantity display
        unitPrice = budgetItem.item.salePrice;
      } else if (budgetItem.type === 'accessory') {
        description = budgetItem.item.name;
        code = 'N/A';
        quantity = '1';
        unitPrice = budgetItem.item.price;
      }

      const rowData = [
        code,
        description,
        quantity,
        unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        budgetItem.price ? budgetItem.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 90, // Adjust table start Y position
    });

    // Calculate totals
    let subTotal = budgetItems.reduce((total, item) => total + item.price, 0);
    let discount = 0; // Implement discount logic later
    let totalFinal = subTotal - discount;

    const finalY = doc.autoTable.previous.finalY; // Get Y position after the table

    // Total calculations
    doc.setFontSize(12);
    doc.text(`Subtotal: ${subTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 140, finalY + 10); // Adjust position
    doc.text(`Desconto: ${discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 140, finalY + 17); // Adjust position
    doc.setFontSize(14);
    doc.text(`Total Final: ${totalFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 140, finalY + 25); // Adjust position

    // Observations
    doc.setFontSize(12);
    doc.text('Observações:', 10, finalY + 35); // Adjust position
    doc.setFontSize(10);
    doc.text('Retirada dos produtos em loja', 10, finalY + 40); // Example observation - adjust position


    doc.save(`budget-${budgetNumber}.pdf`);
  };

  const handleFinalizeBudget = () => {
    console.log("handleFinalizeBudget - typeof setBudgets:", typeof setBudgets); // Debug log
    console.log("Value of budgets inside handleFinalizeBudget:", budgets); // Debug log
    const currentBudgets = Array.isArray(budgets) ? budgets : []; // Garante que budgets é um array
    // Criar um novo objeto de orçamento
    const newBudget = {
      id: currentBudgets.length + 1, // Usa currentBudgets.length para evitar erro
      customerName: selectedClient ? selectedClient.name : 'Novo Cliente', // Use selected client name or 'Novo Cliente' if new
      totalValue: budgetItems.reduce((total, item) => total + item.price, 0), // Sum up prices of all items
      creationDate: new Date(),
      status: 'pendente', // Set status to 'pendente'
      items: budgetItems, // Save budget items
    };

    // Atualizar a lista de orçamentos no estado do App
    setBudgets([...currentBudgets, newBudget]); // Usa currentBudgets aqui também

    setFinalizedBudget(newBudget); // Store finalized budget in state
    setBudgetItems([]); // Clear budget items after finalize
    setIsBudgetFinalized(true); // Set isBudgetFinalized to true after finalize
    alert('Orçamento finalizado e status definido como "pendente".');
    // Em um futuro próximo, você precisará implementar a lógica para salvar os dados do orçamento
    // e atualizar o estado da aplicação para refletir o orçamento pendente.
  };

  const handleCancelBudget = () => {
    setBudgetItems([]); // Clear budget items
    setIsBudgetFinalized(false); // Reset isBudgetFinalized when budget is cancelled
    setFinalizedBudget(null); // Clear finalized budget when cancelled
    alert('Orçamento cancelado.');
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

      {isBudgetFinalized && (
        <div className="finalized-budget-section">
          <h3>Orçamento Finalizado</h3>
          {finalizedBudget && (
            <div>
              <p><strong>Cliente:</strong> {finalizedBudget.customerName}</p>
              <h4>Itens:</h4>
              <ul>
                {finalizedBudget.items.map((item, index) => (
                  <li key={index}>
                    {item.type === 'product' ? (
                      `${item.item.name} - ${item.item.model} - Qtd: ${item.item.calculationMethod === 'm2' ? `${item.length}x${item.height} m²` : '1'} - Preço: ${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    ) : (
                      `${item.item.name} - Acessório - Preço: ${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    )}
                  </li>
                ))}
              </ul>
              <p><strong>Total:</strong> {finalizedBudget.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
          )}
          <button onClick={generatePDF}>Gerar PDF</button>
        </div>
      )}

      {!isBudgetFinalized && <button onClick={handleFinalizeBudget}>Finalizar Orçamento</button>}
      <button onClick={handleCancelBudget}>Cancelar Orçamento</button>
    </div>
  );
}

export default Budgets;
