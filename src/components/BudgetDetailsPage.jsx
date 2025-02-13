import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './BudgetDetailsPage.css';

function BudgetDetailsPage({ budgets, companyLogo }) {
  const { budgetId } = useParams();
  const budget = budgets.find(budget => budget.id === parseInt(budgetId, 10));
  const [configuracoes, setConfiguracoes] = useState({});

  useEffect(() => {
    const storedConfig = localStorage.getItem('configuracoes');
    if (storedConfig) {
      setConfiguracoes(JSON.parse(storedConfig));
    }
  }, []);

  if (!budget) {
    return <p>Orçamento não encontrado.</p>;
  }

  const creationDate = new Date(budget.creationDate);
  const formattedCreationDate = creationDate.toLocaleDateString();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Company Logo and Header
    let x = 10;
    let y = 10;

    // Add company info
    doc.setFontSize(12);
    doc.text(configuracoes.nomeFantasia || 'Ultracred', 120, y);
    y += 7;
    doc.text(`CNPJ: ${configuracoes.cnpj || '13.601.392/0001-96'}`, 120, y);
    y += 7;
    doc.text(configuracoes.endereco || 'av paulista', 120, y);
    y += 7;
    doc.text(`Tel.: ${configuracoes.telefone || '1533333840'}`, 120, y);
    y += 15;

    // Add budget info
    doc.text(`Data: ${formattedCreationDate}`, 10, y);
    doc.text(`Orçamento No: ${budget.id}`, 120, y);
    y += 15;

    // Add client info
    doc.text('Cliente:', 10, y);
    y += 7;
    doc.text(`Nome: ${budget.customerName}`, 10, y);
    y += 15;

    // Add items table
    const tableColumn = ["Descrição", "QTD", "Preço Unit.", "Total"];
    const tableRows = budget.items.map(item => {
      let description = item.type === 'product' 
        ? `${item.item?.name || 'N/A'} - ${item.item?.model || 'N/A'}`
        : `${item.item?.name || 'N/A'} - Acessório`;
      
      let quantity = item.type === 'product' 
        ? (item.item?.calculationMethod === 'm2' ? `${item.length} x ${item.height} m2` : '1')
        : '1';
      
      let unitPrice = item.type === 'product'
        ? item.item?.salePrice || 0
        : item.item?.price || 0;

      return [
        description,
        quantity,
        unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        item.price ? item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'
      ];
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: y,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [200, 200, 200] }
    });

    // Add total
    const finalY = doc.autoTable.previous.finalY;
    doc.text(`Total: ${budget.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 120, finalY + 10);

    // Add observations
    doc.text('Observações:', 10, finalY + 20);
    doc.text('Retirada dos produtos em loja', 10, finalY + 27);

    // Save PDF
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
            <p>{configuracoes.nomeFantasia || 'Ultracred'}</p>
            <p>CNPJ: {configuracoes.cnpj ? configuracoes.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '13.601.392/0001-96'}</p>
            <p>{configuracoes.endereco || 'av paulista'}</p>
            <p>Tel.: {configuracoes.telefone || '1533333840'}</p>
          </div>
        </div>

        <div className="budget-content">
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
                    <th>Preço Unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        {item.type === 'product' ? (
                          `${item.item?.name || 'N/A'} - ${item.item?.model || 'N/A'}`
                        ) : (
                          `${item.item?.name || 'N/A'} - Acessório`
                        )}
                      </td>
                      <td>
                        {item.type === 'product' ? (item.item?.calculationMethod === 'm2' ? `${item.length} x ${item.height} m2` : '1') : '1'}
                      </td>
                      <td>{item.price ? item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}</td>
                      <td>{item.price ? item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Nenhum item neste orçamento.</p>
            )}
          </section>

          <section className="totals-section">
            <p>Total: R$ {budget.totalValue.toFixed(2)}</p>
          </section>

          <section className="observations-section">
            <h3>Observações</h3>
            <p>Retirada dos produtos em loja</p>
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
