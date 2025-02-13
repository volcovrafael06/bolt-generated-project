import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './BudgetDetailsPage.css';

function BudgetDetailsPage({ budgets = [], companyLogo }) {
  const { budgetId } = useParams();
  const budget = budgets.find(budget => budget.id === parseInt(budgetId, 10));
  const [configuracoes, setConfiguracoes] = useState({});

  useEffect(() => {
    const storedConfig = localStorage.getItem('configuracoes');
    if (storedConfig) {
      setConfiguracoes(JSON.parse(storedConfig));
    }
  }, []);

  const formatCurrency = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getItemDescription = (item) => {
    if (!item || !item.item) return 'Item não especificado';

    if (item.type === 'product') {
      const product = item.item;
      let description = [
        product.name || 'Produto',
        product.model || '',
        product.material || ''
      ].filter(Boolean).join(' - ');

      if (item.length) {
        description += ` (${item.length}${item.height ? ` x ${item.height}` : ''} m2)`;
      }
      if (item.hasBando) {
        description += ' + Bando';
      }
      return description;
    } else {
      return `${item.item.name || 'Acessório'}`;
    }
  };

  const getItemQuantity = (item) => {
    if (!item) return '1';

    if (item.type === 'product') {
      if (item.length) {
        return `${item.length}${item.height ? ` x ${item.height}` : ''} m2`;
      }
      return '1';
    }
    return '1';
  };

  const getItemUnitPrice = (item) => {
    if (!item || !item.item) return 0;

    if (item.type === 'product') {
      const product = item.item;
      if (!product.salePrice) return 0;

      // For products with m2 calculation
      if (item.length && item.height) {
        return product.salePrice;
      }
      // For products with linear calculation (like Wave)
      if (item.length && !item.height) {
        return product.salePrice;
      }
      return product.salePrice;
    }
    return item.item.price || 0;
  };

  if (!budget) {
    return <p>Orçamento não encontrado.</p>;
  }

  const creationDate = new Date(budget.creationDate);
  const formattedCreationDate = creationDate.toLocaleDateString();
  
  const validityDays = parseInt(configuracoes.validadeOrcamento || '30', 10);
  const validityDate = new Date(creationDate);
  validityDate.setDate(validityDate.getDate() + validityDays);
  const formattedValidityDate = validityDate.toLocaleDateString();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    let y = 10;

    // Add company info
    doc.setFontSize(12);
    doc.text(configuracoes.nomeFantasia || 'Empresa', 120, y);
    y += 7;
    doc.text(`CNPJ: ${configuracoes.cnpj || ''}`, 120, y);
    y += 7;
    doc.text(configuracoes.endereco || '', 120, y);
    y += 7;
    doc.text(`Tel.: ${configuracoes.telefone || ''}`, 120, y);
    y += 15;

    // Add dates and budget number
    doc.text(`Data: ${formattedCreationDate}`, 10, y);
    doc.text(`Validade: ${formattedValidityDate}`, 80, y);
    doc.text(`Orçamento No: ${budget.id}`, 150, y);
    y += 15;

    // Add client info
    doc.text('Cliente:', 10, y);
    y += 7;
    doc.text(`Nome: ${budget.customerName}`, 10, y);
    y += 15;

    // Add items table
    const tableColumn = ["Descrição", "QTD", "Preço M2", "Total"];
    const tableRows = (budget.items || []).map(item => [
      getItemDescription(item),
      getItemQuantity(item),
      formatCurrency(getItemUnitPrice(item)),
      formatCurrency(item.price || 0)
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: y,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [200, 200, 200] }
    });

    const finalY = doc.autoTable.previous.finalY;
    doc.text(`Total: ${formatCurrency(budget.totalValue || 0)}`, 120, finalY + 10);

    doc.text('Observações:', 10, finalY + 20);
    doc.text(budget.observation || 'Retirada dos produtos em loja', 10, finalY + 27);

    doc.save(`orcamento-${budget.id}.pdf`);
  };

  return (
    <div className="budget-details-container">
      <div className="budget-print-layout">
        <div className="header-section">
          <div className="logo-section">
            {companyLogo && (
              <img src={companyLogo} alt="Company Logo" className="company-logo" />
            )}
          </div>
          <div className="company-info">
            <p>{configuracoes.nomeFantasia || 'Empresa'}</p>
            <p>CNPJ: {configuracoes.cnpj || ''}</p>
            <p>{configuracoes.endereco || ''}</p>
            <p>Tel.: {configuracoes.telefone || ''}</p>
          </div>
        </div>

        <div className="budget-content">
          <div className="dates-section">
            <p>Data do Orçamento: {formattedCreationDate}</p>
            <p>Válido até: {formattedValidityDate}</p>
          </div>

          <section className="client-section">
            <h3>Cliente</h3>
            <p>Nome: {budget.customerName}</p>
          </section>

          <section className="items-section">
            <h3>Itens do Orçamento</h3>
            {budget.items && budget.items.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>QTD</th>
                    <th>Preço M2</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.items.map((item, index) => (
                    <tr key={index}>
                      <td>{getItemDescription(item)}</td>
                      <td>{getItemQuantity(item)}</td>
                      <td>{formatCurrency(getItemUnitPrice(item))}</td>
                      <td>{formatCurrency(item.price || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Nenhum item neste orçamento.</p>
            )}
          </section>

          <section className="totals-section">
            <p>Total: {formatCurrency(budget.totalValue || 0)}</p>
          </section>

          <section className="observations-section">
            <h3>Observações</h3>
            <p>{budget.observation || 'Retirada dos produtos em loja'}</p>
          </section>
        </div>
      </div>
      <div className="button-container">
        <button onClick={handlePrint} className="action-button">Imprimir</button>
        <button onClick={handleDownloadPDF} className="action-button">Download PDF</button>
      </div>
    </div>
  );
}

export default BudgetDetailsPage;
