import React, { useState, useEffect } from 'react';
import './Reports.css';
import { supabase } from '../supabase/client';

function Reports({ budgets }) {
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({
    totalBudgets: 0,
    finalized: 0,
    pending: 0,
    cancelled: 0,
    averageTicket: 0,
    totalRevenue: 0,
    totalCosts: 0,
    totalProfit: 0,
    profitMargin: 0,
    totalInstallation: 0
  });

  useEffect(() => {
    processReportData();
  }, [period, startDate, endDate, budgets]);

  const calculateProductCost = async (product) => {
    try {
      // Buscar o produto no banco para obter o preço de custo
      const { data: productData } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', product.produto_id)
        .single();

      if (!productData) return 0;

      const width = parseFloat(product.largura) || 0;
      const height = parseFloat(product.altura) || 0;
      const costPrice = parseFloat(productData.preco_custo) || 0;

      // Calcula o custo baseado no modelo
      let productCost = 0;
      if (productData.modelo?.toUpperCase() === 'WAVE') {
        productCost = width * costPrice;
      } else {
        productCost = width * height * costPrice;
      }

      return productCost;
    } catch (error) {
      console.error('Erro ao calcular custo do produto:', error);
      return 0;
    }
  };

  const processReportData = async () => {
    if (!budgets) return;

    let filteredBudgets = [...budgets];

    // Apply date filters if custom period is selected
    if (period === 'custom' && startDate && endDate) {
      filteredBudgets = filteredBudgets.filter(budget => {
        const budgetDate = new Date(budget.created_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return budgetDate >= start && budgetDate <= end;
      });
    } else if (period === 'monthly') {
      const today = new Date();
      filteredBudgets = filteredBudgets.filter(budget => {
        const budgetDate = new Date(budget.created_at);
        return budgetDate.getMonth() === today.getMonth() &&
               budgetDate.getFullYear() === today.getFullYear();
      });
    }

    // Process detailed budget data
    const processedData = await Promise.all(
      filteredBudgets
        .filter(budget => budget.status === 'finalizado')
        .map(async budget => {
          const produtos = JSON.parse(budget.produtos_json || '[]');
          
          // Calculate total installation fee
          const installationFee = produtos.reduce((sum, prod) => {
            return sum + (prod.instalacao ? (parseFloat(prod.valor_instalacao) || 0) : 0);
          }, 0);

          // Calculate costs for each product
          const productCosts = await Promise.all(
            produtos.map(prod => calculateProductCost(prod))
          );

          const totalCost = productCosts.reduce((sum, cost) => sum + cost, 0);
          const saleValue = parseFloat(budget.valor_total) || 0;
          const profit = saleValue - totalCost - installationFee;
          const margin = saleValue > 0 ? (profit / saleValue) * 100 : 0;

          return {
            id: budget.id,
            date: new Date(budget.created_at).toLocaleDateString(),
            customerName: budget.clientes?.name || 'Cliente não encontrado',
            saleValue,
            installationFee,
            cost: totalCost,
            profit,
            margin: margin.toFixed(2),
            products: produtos.length,
            accessories: 0, // Se necessário, adicionar cálculo de acessórios
            productDetails: produtos.map((prod, index) => ({
              ...prod,
              cost: productCosts[index]
            }))
          };
        })
    );

    // Calculate summary statistics
    const summaryStats = {
      totalBudgets: filteredBudgets.length,
      finalized: filteredBudgets.filter(b => b.status === 'finalizado').length,
      pending: filteredBudgets.filter(b => b.status === 'pendente').length,
      cancelled: filteredBudgets.filter(b => b.status === 'cancelado').length,
      totalRevenue: processedData.reduce((sum, item) => sum + item.saleValue, 0),
      totalCosts: processedData.reduce((sum, item) => sum + item.cost, 0),
      totalInstallation: processedData.reduce((sum, item) => sum + item.installationFee, 0),
      totalProfit: processedData.reduce((sum, item) => sum + item.profit, 0),
      averageTicket: processedData.length > 0 ? 
        processedData.reduce((sum, item) => sum + item.saleValue, 0) / processedData.length : 0,
      profitMargin: processedData.length > 0 ?
        (processedData.reduce((sum, item) => sum + item.profit, 0) / 
         processedData.reduce((sum, item) => sum + item.saleValue, 0) * 100) : 0
    };

    setReportData(processedData);
    setSummary(summaryStats);
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
    if (event.target.value !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  const toggleProductDetails = (budgetId) => {
    setReportData(data => 
      data.map(item => 
        item.id === budgetId 
          ? { ...item, showDetails: !item.showDetails }
          : item
      )
    );
  };

  return (
    <div className="reports-container">
      <h2>Relatório Gerencial</h2>

      <div className="filter-options">
        <label htmlFor="period">Período:</label>
        <select id="period" value={period} onChange={handlePeriodChange}>
          <option value="daily">Diário</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
          <option value="yearly">Anual</option>
          <option value="custom">Personalizado</option>
        </select>

        {period === 'custom' && (
          <>
            <label htmlFor="startDate">Data de Início:</label>
            <input 
              type="date" 
              id="startDate" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />

            <label htmlFor="endDate">Data de Término:</label>
            <input 
              type="date" 
              id="endDate" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </>
        )}
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Visão Geral</h3>
          <p>Total de Orçamentos: {summary.totalBudgets}</p>
          <p>Finalizados: {summary.finalized}</p>
          <p>Pendentes: {summary.pending}</p>
          <p>Cancelados: {summary.cancelled}</p>
        </div>
        
        <div className="summary-card">
          <h3>Desempenho Financeiro</h3>
          <p>Receita Total: {summary.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p>Custos Totais: {summary.totalCosts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p>Total Instalação: {summary.totalInstallation.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p>Lucro Total: {summary.totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p>Margem de Lucro: {summary.profitMargin.toFixed(2)}%</p>
          <p>Ticket Médio: {summary.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </div>

      <h3>Detalhamento dos Orçamentos Finalizados</h3>
      <table className="report-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Valor da Venda</th>
            <th>Taxa de Instalação</th>
            <th>Custo Total</th>
            <th>Lucro</th>
            <th>Margem (%)</th>
            <th>Produtos</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map(item => (
            <React.Fragment key={item.id}>
              <tr>
                <td>{item.date}</td>
                <td>{item.customerName}</td>
                <td>{item.saleValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>{item.installationFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>{item.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>{item.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>{item.margin}%</td>
                <td>{item.products}</td>
                <td>
                  <button onClick={() => toggleProductDetails(item.id)}>
                    {item.showDetails ? 'Ocultar' : 'Detalhes'}
                  </button>
                </td>
              </tr>
              {item.showDetails && (
                <tr className="details-row">
                  <td colSpan="9">
                    <div className="product-details">
                      <h4>Detalhes dos Produtos</h4>
                      {item.productDetails.map((prod, index) => (
                        <div key={index} className="product-detail-item">
                          <p>Produto {index + 1}:</p>
                          <p>Dimensões: {prod.largura}m x {prod.altura}m</p>
                          <p>Custo: {prod.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          <p>Instalação: {prod.instalacao ? prod.valor_instalacao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não'}</p>
                          <p>Bandô: {prod.bando ? 'Incluído' : 'Não incluído'}</p>
                          {prod.bando && prod.valor_bando && (
                            <p>Valor do Bandô: {parseFloat(prod.valor_bando).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          )}
                          <p>Subtotal: {parseFloat(prod.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Reports;
