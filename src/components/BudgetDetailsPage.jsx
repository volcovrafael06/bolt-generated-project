import React from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function BudgetDetailsPage({ budgets }) {
  const { budgetId } = useParams();
  const budget = budgets.find(budget => budget.id === parseInt(budgetId, 10));

  if (!budget) {
    return <p>Orçamento não encontrado.</p>;
  }

  const creationDate = new Date(budget.creationDate);
  const formattedCreationDate = creationDate.toLocaleDateString();

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(16);
    doc.text('Orçamento', 105, y, { align: 'center' });
    y += 10;

    // Budget info
    doc.setFontSize(12);
    doc.text(`Orçamento No: ${budget.id}`, 10, y);
    doc.text(`Data: ${formattedCreationDate}`, 10, y + 10);
    doc.text(`Cliente: ${budget.customerName}`, 10, y + 20);
    y += 40;

    // Items table
    const tableColumn = ["Item", "Dimensões", "Preço"];
    const tableRows = budget.items.map(item => {
      if (!item) return ['', '', '']; // Handle undefined items
      
      let description = '';
      let dimensions = '';
      let price = '';

      if (item.type === 'product' && item.item) {
        description = `${item.item.name || 'N/A'} - ${item.item.model || 'N/A'}`;
        dimensions = item.length ? 
          (item.height ? 
            `${item.length}x${item.height}` : 
            `${item.length}`) 
          : 'N/A';
        price = item.price ? 
          item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
          : 'N/A';
      } else if (item.type === 'accessory' && item.item) {
        description = item.item.name || 'Acessório';
        dimensions = 'N/A';
        price = item.price ? 
          item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
          : 'N/A';
      }

      return [description, dimensions, price];
    }).filter(row => row[0] !== ''); // Remove empty rows

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: y,
    });

    y = doc.lastAutoTable.finalY + 20;

    // Additional costs
    if (budget.bando) {
      doc.text(`Bando: ${budget.bandoPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'N/A'}`, 10, y);
      y += 10;
    }

    if (budget.installation) {
      doc.text(`Instalação: ${budget.installationPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'N/A'}`, 10, y);
      y += 10;
    }

    // Total
    doc.setFontSize(14);
    doc.text(`Total: ${budget.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 10, y + 10);

    // Observation
    if (budget.observation) {
      y += 30;
      doc.setFontSize(12);
      doc.text('Observações:', 10, y);
      doc.text(budget.observation, 10, y + 10);
    }

    doc.save(`orcamento-${budget.id}.pdf`);
  };

  return (
    <div>
      <h2>Detalhes do Orçamento</h2>
      <div className="budget-details">
        <p><strong>Cliente:</strong> {budget.customerName}</p>
        <p><strong>Data:</strong> {formattedCreationDate}</p>
        <p><strong>Status:</strong> {budget.status}</p>

        <h3>Itens</h3>
        <ul>
          {budget.items.map((item, index) => {
            if (!item || !item.item) return null; // Skip invalid items
            
            return (
              <li key={index}>
                {item.type === 'product' ? (
                  <>
                    {item.item.name} - {item.item.model}
                    {item.length && ` - ${item.length}${item.height ? `x${item.height}` : ''}`}
                    {item.price && ` - ${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                  </>
                ) : (
                  <>
                    {item.item.name} - 
                    {item.price && item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </>
                )}
              </li>
            );
          })}
        </ul>

        {budget.bando && (
          <p><strong>Bando:</strong> {budget.bandoPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        )}

        {budget.installation && (
          <p><strong>Instalação:</strong> {budget.installationPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        )}

        <p><strong>Total:</strong> {budget.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>

        {budget.observation && (
          <>
            <h3>Observações</h3>
            <p>{budget.observation}</p>
          </>
        )}

        <button onClick={generatePDF}>Gerar PDF</button>
      </div>
    </div>
  );
}

export default BudgetDetailsPage;
