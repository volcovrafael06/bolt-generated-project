import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './BudgetDetailsPage.css';
import { supabase } from '../supabase/client';

function BudgetDetailsPage({ budgets, companyLogo }) {
  const { budgetId } = useParams();
  const [budget, setBudget] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBudgetDetails = async () => {
      try {
        // Fetch budget with customer data
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

        // Fetch all products to get their details
        const { data: productsData, error: productsError } = await supabase
          .from('produtos')
          .select('*');

        if (productsError) throw productsError;

        setBudget(budgetData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading budget details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadBudgetDetails();
  }, [budgetId]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!budget) return <p>Orçamento não encontrado.</p>;

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

  const budgetProducts = JSON.parse(budget.produtos_json || '[]');

  return (
    <div className="budget-details-container">
      <div className="budget-print-layout">
        <div className="header-section">
          <div className="logo-section">
            {companyLogo ? (
              <img src={companyLogo} alt="Logo da Empresa" className="company-logo" />
            ) : (
              <img src="/persifix-logo.png" alt="Logo da Empresa" className="company-logo" />
            )}
          </div>
          <div className="company-info">
            <p>Ultracred</p>
            <p>CNPJ: 13.601.392/0001-96</p>
            <p>av paulista</p>
            <p>Tel.: 1533333840</p>
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

          <section className="totals-section">
            <div className="price-breakdown">
              <p>Total: {formatCurrency(budget.valor_total)}</p>
            </div>
          </section>

          {budget.observacao && (
            <section className="observations-section">
              <h3>Observações</h3>
              <p>{budget.observacao}</p>
            </section>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={() => window.print()} className="print-button">Imprimir</button>
        <button className="download-pdf-button">Download PDF</button>
      </div>
    </div>
  );
}

export default BudgetDetailsPage;
