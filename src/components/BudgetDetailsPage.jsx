import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
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

  const calculateValidadeDate = (createdAt, validadeDias) => {
    return new Date(new Date(createdAt).getTime() + validadeDias * 24 * 60 * 60 * 1000).toLocaleDateString();
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const content = contentRef.current;
    
    if (!content) return;
    
    // Use html2canvas to capture the exact layout
    const canvas = await html2canvas(content, {
      scale: 2, // Higher quality
      useCORS: true, // Allow loading external images
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Add the captured image to PDF
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate scaling to fit the page width while maintaining aspect ratio
    const scale = pdfWidth / imgWidth;
    const scaledHeight = imgHeight * scale;
    
    // Add multiple pages if content is too long
    let heightLeft = scaledHeight;
    let position = 0;
    
    // First page
    doc.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
    heightLeft -= pdfHeight;
    
    // Add new pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - scaledHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;
    }
    
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
            <img 
              src={companyLogo} 
              alt="Logo da Empresa" 
              className="budget-logo"
            />
          )}
          <div className="company-info">
            <h2>{companyData?.nome_fantasia || ''}</h2>
            <p>CNPJ: {companyData?.cnpj || ''}</p>
            <p>{companyData?.endereco || ''}</p>
            <p>Tel.: {companyData?.telefone || ''}</p>
          </div>
        </div>

        <div className="budget-header">
          <h1>Orçamento #{budgetId}</h1>
          <div className="budget-dates">
            <p>Data do Orçamento: {new Date(budget.created_at).toLocaleDateString()}</p>
            <p>Válido até: {calculateValidadeDate(budget.created_at, companyData?.validade_orcamento || 30)}</p>
          </div>
        </div>

        <div className="client-info budget-section">
          <h3>Cliente</h3>
          <p>Nome: {budget.clientes?.name || 'Cliente não encontrado'}</p>
          <p>Endereço: {budget.clientes?.address || ''}</p>
          <p>Telefone: {budget.clientes?.phone || ''}</p>
        </div>

        <div className="items-section budget-section">
          <h3>Itens do Orçamento</h3>
          {budgetProducts.length > 0 ? (
            <table className="budget-table">
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
                      <td className="text-right">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>Nenhum item neste orçamento.</p>
          )}
        </div>

        {budgetAccessories && budgetAccessories.length > 0 && (
          <div className="accessories-section budget-section">
            <h3>Acessórios</h3>
            <table className="budget-table">
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
                  const accessoryName = accessories.find(a => a.id === acc.accessory_id)?.name || 'Acessório não encontrado';
                  return (
                    <tr key={index}>
                      <td>{accessoryName}</td>
                      <td>{acc.color || 'N/A'}</td>
                      <td className="text-center">{acc.quantity || 0}</td>
                      <td className="text-right">{formatCurrency(acc.subtotal || 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="budget-total">
          <h3>Total: {formatCurrency(budget.valor_total)}</h3>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={generatePDF} className="print-button">
          Gerar PDF
        </button>
      </div>
    </div>
  );
}

export default BudgetDetailsPage;
