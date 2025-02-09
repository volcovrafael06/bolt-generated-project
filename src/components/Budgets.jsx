import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Budgets.css'; // Import CSS file for styling

function Budgets({ customers, products, setCustomers }) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [length, setLength] = useState(0);
  const [height, setHeight] = useState(0);

  const handleClientSelect = (event) => {
    setSelectedClient(customers.find(client => client.id === event.target.value));
  };

  const handleProductSelect = (event) => {
    setSelectedProduct(products.find(product => product.id === event.target.value));
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


  return (
    <div className="budgets-container">
      <div className="client-section">
        <h2>Cliente</h2>
        <select value={selectedClient?.id || ''} onChange={handleClientSelect}>
          <option value="">Selecione um Cliente</option>
          {customers.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
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
