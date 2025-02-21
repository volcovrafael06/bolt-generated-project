import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './BudgetDetailsPage.css';
import { supabase } from '../supabase/client';

function BudgetDetailsPage({ companyLogo }) {
  const { budgetId } = useParams();
  const [budget, setBudget] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessories, setAccessories] = useState([]);
  const [companyData, setCompanyData] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const loadBudgetDetails = async () => {
      try {
        console.log('Loading budget details for ID:', budgetId);
        const { data: budgetData, error: budgetError } = await supabase
          .from('orcamentos')
          .select(`
            *,
            clientes (
              id,
              name,
              email,
              phone,
              address
            )
          `)
          .eq('id', budgetId)
          .single();

        if (budgetError) throw budgetError;

        console.log('Budget data loaded:', budgetData);
        
        // Carregar os acessórios
        const { data: accessoriesData, error: accessoriesError } = await supabase
          .from('accessories')
          .select('*');

        if (accessoriesError) throw accessoriesError;
        console.log('All accessories data:', accessoriesData);

        // Carregar os produtos
        const { data: productsData, error: productsError } = await supabase
          .from('produtos')
          .select('*');

        if (productsError) throw productsError;
        console.log('Products data loaded:', productsData);

        setBudget(budgetData);
        setProducts(productsData);
        setAccessories(accessoriesData);
      } catch (error) {
        console.error('Error loading budget details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const loadCompanyData = async () => {
      try {
        const { data, error } = await supabase
          .from('configuracoes')
          .select('*')
          .single();

        if (error) throw error;
        setCompanyData(data);
      } catch (error) {
        console.error('Error loading company data:', error);
      }
    };

    loadCompanyData();
    loadBudgetDetails();
  }, [budgetId]);

  const formatCurrency = (value) => {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getProductDetails = (productId) => {
    return products.find(p => p.id === productId) || {};
  };

  const formatProductDescription = (product, item) => {
    const productDetails = getProductDetails(item.produto_id);
    let description = [
      productDetails.nome || 'Produto',
      productDetails.modelo || '',
      productDetails.tecido || '',
      productDetails.codigo || ''
    ].filter(Boolean).join(' - ');

    if (item.bando) {
      description += ' COM BANDO';
    }

    if (item.instalacao) {
      description += ' INSTALADO';
    }

    return description;
  };

  const getAccessoryName = (accessoryId) => {
    if (!accessories || !accessoryId) return 'Acessório não encontrado';
    const accessory = accessories.find(a => a.id === accessoryId);
    return accessory ? accessory.name : 'Acessório não encontrado';
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add red header lines
    doc.setDrawColor(190, 0, 0);
    doc.setLineWidth(1);
    doc.line(20, 15, 190, 15);
    doc.line(20, 45, 190, 45);
    
    // Add company logo text in red
    doc.setTextColor(190, 0, 0);
    doc.setFontSize(28);
    doc.text('PersiFIX', 30, 35);
    doc.setFontSize(11);
    doc.text('Cortinas e Persianas', 30, 41);
    
    // Reset text color to black
    doc.setTextColor(0, 0, 0);
    
    // Add company info aligned to the right
    doc.setFontSize(10);
    const companyInfo = [
      'Ultracred',
      'CNPJ: 13.601.392/0001-96',
      'av paulista',
      'Tel.: 1533333840'
    ];
    
    // Right align company info
    companyInfo.forEach((text, index) => {
      const textWidth = doc.getStringUnitWidth(text) * 10 / doc.internal.scaleFactor;
      doc.text(text, 190 - textWidth, 25 + (index * 5));
    });
    
    // Add dates with proper spacing
    doc.text(`Data do Orçamento: ${new Date(budget.created_at).toLocaleDateString()}`, 20, 70);
    const validadeText = `Válido até: ${new Date(new Date(budget.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
    const validadeWidth = doc.getStringUnitWidth(validadeText) * 10 / doc.internal.scaleFactor;
    doc.text(validadeText, 190 - validadeWidth, 70);
    
    // Add Cliente section with border
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.1);
    doc.rect(20, 80, 170, 35);
    
    // Add Cliente title
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text('Cliente', 25, 90);
    
    // Add client info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text([
      `Nome: ${budget.clientes?.name || 'Cliente não encontrado'}`,
      `Endereço: ${budget.clientes?.address || ''}`,
      `Telefone: ${budget.clientes?.phone || ''}`
    ], 25, 100);
    
    // Add Itens do Orçamento section with border
    doc.setDrawColor(220, 220, 220);
    doc.rect(20, 125, 170, 50);
    
    // Add items table with proper styling
    const budgetProducts = JSON.parse(budget.produtos_json || '[]');
    const budgetAccessories = JSON.parse(budget.acessorios_json || '[]');
    
    let currentY = 125;
    
    if (budgetProducts.length > 0) {
      doc.autoTable({
        startY: currentY,
        head: [['Descrição', 'Total']],
        body: budgetProducts.map(item => [
          formatProductDescription({}, item),
          formatCurrency(item.subtotal)
        ]),
        theme: 'plain',
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [60, 60, 60],
          fontSize: 11,
          fontStyle: 'bold',
          cellPadding: { top: 8, right: 8, bottom: 8, left: 8 }
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 40, halign: 'right' }
        },
        styles: {
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        margin: { left: 20, right: 20 },
        tableWidth: 170
      });
      
      currentY = doc.lastAutoTable.finalY + 10;
    }

    // Add accessories table
    if (budgetAccessories.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text('Acessórios', 20, currentY);
      currentY += 10;

      doc.autoTable({
        startY: currentY,
        head: [['Descrição', 'Cor', 'Quantidade', 'Total']],
        body: budgetAccessories.map(acc => [
          accessories.find(a => a.id === acc.accessory_id)?.name || 'Acessório não encontrado',
          acc.color || 'N/A',
          acc.quantity || 0,
          formatCurrency(acc.subtotal || 0)
        ]),
        theme: 'plain',
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [60, 60, 60],
          fontSize: 11,
          fontStyle: 'bold',
          cellPadding: { top: 8, right: 8, bottom: 8, left: 8 }
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 40 },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 40, halign: 'right' }
        },
        styles: {
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        margin: { left: 20, right: 20 },
        tableWidth: 170
      });
      
      currentY = doc.lastAutoTable.finalY + 10;
    }
      
    // Add final total with border
    doc.setDrawColor(220, 220, 220);
    doc.rect(20, currentY - 5, 170, 20);
    const totalText = `Total: ${formatCurrency(budget.valor_total)}`;
    const totalWidth = doc.getStringUnitWidth(totalText) * 10 / doc.internal.scaleFactor;
    doc.text(totalText, 190 - totalWidth, currentY + 7);
    
    // Save the PDF
    doc.save(`orcamento_${budgetId}.pdf`);
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!budget) return <p>Orçamento não encontrado.</p>;

  console.log('Rendering budget:', budget);
  console.log('Products:', products);
  console.log('All accessories:', accessories);

  const budgetProducts = JSON.parse(budget.produtos_json || '[]');
  let budgetAccessories = [];
  try {
    budgetAccessories = JSON.parse(budget.acessorios_json || '[]');
    console.log('Raw accessories JSON:', budget.acessorios_json);
    console.log('Parsed accessories:', budgetAccessories);
  } catch (e) {
    console.error('Error parsing accessories:', e);
  }

  return (
    <div className="budget-details-page">
      <div className="budget-print-layout" ref={contentRef}>
        <div className="company-header">
          {companyLogo && (
            <img src={companyLogo} alt="Logo da empresa" className="company-logo" />
          )}
          <div className="company-info">
            {companyData && (
              <>
                <h2>{companyData.nome_fantasia || 'Ultracred'}</h2>
                <p>CNPJ: {companyData.cnpj}</p>
                <p>{companyData.endereco}</p>
                <p>Tel.: {companyData.telefone}</p>
              </>
            )}
          </div>
        </div>

        <div className="budget-content">
          <div className="dates-section">
            <p>Data do Orçamento: {new Date(budget.created_at).toLocaleDateString()}</p>
            <p>Válido até: {new Date(new Date(budget.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          </div>

          <section className="client-section">
            <h3>Cliente</h3>
            <p>Nome: {budget.clientes?.name || 'Cliente não encontrado'}</p>
            {budget.clientes?.address && <p>Endereço: {budget.clientes.address}</p>}
            {budget.clientes?.phone && <p>Telefone: {budget.clientes.phone}</p>}
          </section>

          <section className="items-section">
            <h3>Itens do Orçamento</h3>
            {budgetProducts.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetProducts.map((item, index) => {
                    const productDetails = getProductDetails(item.produto_id);
                    return (
                      <tr key={index}>
                        <td>{formatProductDescription(productDetails, item)}</td>
                        <td>{formatCurrency(item.subtotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>Nenhum item neste orçamento.</p>
            )}
          </section>

          {/* Seção de Acessórios */}
          <section className="items-section">
            <h3>Acessórios</h3>
            {budgetAccessories && budgetAccessories.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Cor</th>
                    <th>Quantidade</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetAccessories.map((acc, index) => {
                    console.log('Rendering accessory:', acc);
                    const accessoryName = accessories.find(a => a.id === acc.accessory_id)?.name || 'Acessório não encontrado';
                    return (
                      <tr key={index}>
                        <td>{accessoryName}</td>
                        <td>{acc.color || 'N/A'}</td>
                        <td>{acc.quantity || 0}</td>
                        <td>{formatCurrency(acc.subtotal || 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>Nenhum acessório neste orçamento.</p>
            )}
          </section>

          <section className="totals-section">
            <div className="price-breakdown">
              <p>Total: {formatCurrency(budget.valor_total)}</p>
            </div>
          </section>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={() => window.print()} className="print-button">
          Imprimir
        </button>
        <button onClick={generatePDF} className="download-pdf-button">
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default BudgetDetailsPage;
