import React from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function BudgetDetailsPage({ budgets, companyLogo }) {
  const { budgetId } = useParams();
  const budget = budgets.find(budget => budget.id === parseInt(budgetId, 10));

  if (!budget) {
    return <p>Orçamento não encontrado.</p>;
  }

  const creationDate = new Date(budget.creationDate);
  const formattedCreationDate = creationDate.toLocaleDateString();

  const generatePDF = () => {
    const doc = new jsPDF();

    // Company Logo and Header
    let x = 10;
    let y = 10;

    if (companyLogo) {
      try {
        if (typeof companyLogo === 'string' && companyLogo.startsWith('data:image')) {
          // Validate base64 string
          if (!companyLogo.includes(';base64,')) {
            console.error("Invalid base64 string format:", companyLogo);
            // Optionally, use a placeholder image or skip adding the logo
            return;
          }

          // It's a base64 string
          const byteString = atob(companyLogo.split(',')[1]);
          const mimeString = companyLogo.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          try {
            const blob = new Blob([ab], { type: mimeString });
            const imgData = URL.createObjectURL(blob);
            doc.addImage(imgData, 'JPEG', x, y, 50, 15);
          } catch (blobError) {
            console.error("Error creating blob or image:", blobError);
          }
        } else if (typeof companyLogo === 'string' && (companyLogo.startsWith('http://') || companyLogo.startsWith('https://'))) {
          // It's a URL
          fetch(companyLogo)
            .then(res => res.blob())
            .then(blob => {
              const imgData = URL.createObjectURL(blob);
              doc.addImage(imgData, 'JPEG', x, y, 50, 15);
              doc.save(`budget-${budgetId}.pdf`); // Save here after image is loaded
            })
            .catch(error => {
              console.error("Error fetching image:", error);
            });
            return; // Important: Exit the function here to prevent saving before the image is loaded
        } else {
          console.warn("companyLogo is not a valid URL or base64 string. Skipping logo.");
        }
      } catch (error) {
        console.error("Error adding company logo:", error);
        // Optionally, use a placeholder image or skip adding the logo
      }
    }
    y += 20;
    doc.setFontSize(12);
    doc.text('PersiFIX Sistemas', x, y);
    doc.setFontSize(10);
    y += 5;
    doc.text('Tel.: (XX) XXXX-XXXX', x, y);
    y += 5;
    doc.text('WhatsApp: (XX) XXXXX-XXXX', x, y);
    y += 5;
    doc.text('Email: email@persifix.com', x, y);

    // Budget Title
    doc.setFontSize(16);
    doc.text('Orçamento', 80, 30);

    // Budget Number and Date
    const budgetNumber = budget.id;
    doc.setFontSize(10);
    doc.text(`Orçamento Nº: ${budgetNumber}`, 150, 15);
    doc.text(`Criado em: ${formattedCreationDate}`, 150, 20);

    // Client Information
    x = 10;
    y = 60;
    doc.setFontSize(12);
    doc.text('Cliente:', x, y);
    doc.setFontSize(10);
    y += 5;
    doc.text(`Nome: ${budget.customerName || 'N/A'}`, x, y);

    // Items Table
    const tableColumn = ["Descrição", "QTD", "Preço Unit.", "Total"];
    const tableRows = [];

    budget.items.forEach((budgetItem, index) => {
      let description = '';
      let quantity = '';
      let unitPrice = 0;

      if (budgetItem.type === 'product') {
        description = `${budgetItem.item?.name || 'N/A'} - ${budgetItem.item?.model || 'N/A'}`;
        quantity = (budgetItem.item?.calculationMethod === 'm2') ? `${budgetItem.length} x ${budgetItem.height} m²` : '1';
        unitPrice = budgetItem.item?.salePrice || 0;
      } else if (budgetItem.type === 'accessory') {
        description = budgetItem.item?.name || 'N/A';
        quantity = '1';
        unitPrice = budgetItem.item?.price || 0;
      }

      const rowData = [
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
      startY: 70,
    });

    // Calculate totals
    let subTotal = budget.items.reduce((total, item) => total + item.price, 0);
    let discount = 0;
    let totalFinal = subTotal - discount;

    const finalY = doc.autoTable.previous.finalY;

    // Total calculations
    doc.setFontSize(12);
    doc.text(`Subtotal: ${subTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 140, finalY + 10);
    doc.text(`Desconto: ${discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 140, finalY + 17);
    doc.setFontSize(14);
    doc.text(`Total Final: ${totalFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 140, finalY + 25);

    // Observations
    doc.setFontSize(12);
    doc.text('Observações:', 10, finalY + 35);
    doc.setFontSize(10);
    doc.text('Retirada dos produtos em loja', 10, finalY + 40);

    doc.save(`budget-${budgetId}.pdf`);
  };

  return (
    <div>
      <h2>Detalhes do Orçamento</h2>
      <p><strong>Cliente:</strong> {budget.customerName}</p>
      <p><strong>Status:</strong> {budget.status}</p>
      <p><strong>Total:</strong> R$ {budget.totalValue.toFixed(2)}</p>
      <p><strong>Criado em:</strong> {formattedCreationDate}</p>

      <h3>Itens do Orçamento</h3>
      {budget.items && budget.items.length > 0 ? (
        <ul>
          {budget.items.map((item, index) => (
            <li key={index}>
              {item.type === 'product' ? (
                `${item.item?.name || 'N/A'} - ${item.item?.model || 'N/A'} - Comprimento: ${item.length} - Altura: ${item.height} - Preço: ${item.price ? item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}`
              ) : (
                `${item.item?.name || 'N/A'} - Acessório - Preço: ${item.price ? item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}`
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum item neste orçamento.</p>
      )}
      <button onClick={generatePDF}>Gerar PDF</button>
    </div>
  );
}

export default BudgetDetailsPage;
