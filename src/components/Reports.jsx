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

  const calculateDimensions = (product, width, height) => {
    // Converter strings para números
    const inputWidth = parseFloat(width) || 0;
    const inputHeight = parseFloat(height) || 0;
    
    // Obter as dimensões mínimas do produto
    const minWidth = parseFloat(product.largura_minima) || 0;
    const minHeight = parseFloat(product.altura_minima) || 0;
    const minArea = parseFloat(product.area_minima) || 0;
    
    // Calcular dimensões finais
    let finalWidth = Math.max(inputWidth, minWidth);
    let finalHeight = Math.max(inputHeight, minHeight);
    
    // Calcular área
    const area = finalWidth * finalHeight;
    
    // Se houver área mínima definida e a área calculada for menor
    if (minArea > 0 && area < minArea) {
      // Ajustar proporcionalmente as dimensões para atingir a área mínima
      const ratio = Math.sqrt(minArea / area);
      finalWidth *= ratio;
      finalHeight *= ratio;
    }
    
    return {
      width: finalWidth,
      height: finalHeight,
      area: finalWidth * finalHeight,
      usedMinimum: finalWidth > inputWidth || finalHeight > inputHeight || (minArea > 0 && area < minArea)
    };
  };

  const calculateProductCost = async (product) => {
    try {
      // Buscar o produto no banco para obter o preço de custo
      const { data: productData } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', product.produto_id)
        .single();

      if (!productData) return { 
        productCost: 0, 
        bandoCost: 0, 
        accessoriesCost: 0,
        accessoriesValue: 0,
        dimensions: { width: 0, height: 0, usedMinimum: false } 
      };

      // Calcular as dimensões considerando os mínimos
      const dimensions = calculateDimensions(
        productData,
        product.largura,
        product.altura
      );

      const costPrice = parseFloat(productData.preco_custo) || 0;

      // Calcula o custo baseado no modelo usando as dimensões calculadas
      let productCost = 0;
      if (productData.modelo?.toUpperCase() === 'WAVE') {
        productCost = dimensions.width * costPrice;
      } else {
        productCost = dimensions.width * dimensions.height * costPrice;
      }

      // Buscar configurações para o preço do bandô
      const { data: configData } = await supabase
        .from('configuracoes')
        .select('bando_custo, bando_venda')
        .single();

      // Calcula o custo e valor do bandô se existir, usando a largura calculada
      let bandoCost = 0;
      let bandoValue = 0;
      
      if (product.bando) {
        const bandoCustoConfig = configData?.bando_custo || 80;
        bandoCost = dimensions.width * bandoCustoConfig;
        bandoValue = dimensions.width * (configData?.bando_venda || 120);
      }

      // Calcula custo e valor dos acessórios
      let accessoriesCost = 0;
      let accessoriesValue = 0;
      
      console.log('Acessórios do produto:', product.acessorios);
      
      if (product.acessorios_json) {
        try {
          const acessorios = JSON.parse(product.acessorios_json);
          console.log('Acessórios parseados:', acessorios);
          
          for (const acessorio of acessorios) {
            const quantidade = parseFloat(acessorio.quantidade) || 0;
            const precoCusto = parseFloat(acessorio.preco_custo) || 0;
            const valor = parseFloat(acessorio.valor) || 0;
            
            accessoriesCost += quantidade * precoCusto;
            accessoriesValue += quantidade * valor;
            
            console.log(`Acessório ${acessorio.nome}:`, {
              quantidade,
              precoCusto,
              valor,
              custoTotal: quantidade * precoCusto,
              valorTotal: quantidade * valor
            });
          }
        } catch (e) {
          console.error('Erro ao processar acessórios:', e);
        }
      }

      console.log('Custos finais:', {
        productCost,
        bandoCost,
        bandoValue,
        accessoriesCost,
        accessoriesValue
      });

      return { 
        productCost, 
        bandoCost,
        bandoValue,
        accessoriesCost,
        accessoriesValue,
        dimensions 
      };
    } catch (error) {
      console.error('Erro ao calcular custo do produto:', error);
      return { 
        productCost: 0, 
        bandoCost: 0,
        bandoValue: 0,
        accessoriesCost: 0,
        accessoriesValue: 0,
        dimensions: { width: 0, height: 0, usedMinimum: false }
      };
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

    // Process the budgets data
    const processedBudgets = await Promise.all(
      filteredBudgets.map(async budget => {
        const produtos = JSON.parse(budget.produtos_json || '[]');
        
        console.log('Produtos do orçamento:', produtos);
        
        // Calculate total installation fee (não é receita, é repasse)
        const installationFee = produtos.reduce((sum, prod) => {
          return sum + (prod.instalacao ? (parseFloat(prod.valor_instalacao) || 0) : 0);
        }, 0);

        // Calculate costs for each product
        const productCosts = await Promise.all(
          produtos.map(prod => calculateProductCost(prod))
        );

        // Combinar os produtos com seus custos calculados
        const produtosProcessados = produtos.map((prod, index) => {
          console.log('Processando produto:', prod);
          return {
            ...prod,
            cost: productCosts[index],
            acessorios: prod.acessorios_json ? JSON.parse(prod.acessorios_json) : []
          };
        });

        console.log('Produtos processados:', produtosProcessados);

        const totalProductCost = productCosts.reduce((sum, cost) => sum + cost.productCost, 0);
        const totalBandoCost = productCosts.reduce((sum, cost) => sum + cost.bandoCost, 0);
        const totalAccessoriesCost = productCosts.reduce((sum, cost) => sum + cost.accessoriesCost, 0);
        const totalCost = totalProductCost + totalBandoCost + totalAccessoriesCost;
        
        // Valor total sem instalação para cálculo do lucro
        const saleValueWithoutInstallation = parseFloat(budget.valor_total || 0) - installationFee;
        
        // Lucro é calculado sem considerar a instalação
        const profit = saleValueWithoutInstallation - totalCost;
        const margin = saleValueWithoutInstallation > 0 ? (profit / saleValueWithoutInstallation) * 100 : 0;

        return {
          id: budget.id,
          date: new Date(budget.created_at).toLocaleDateString(),
          customerName: budget.clientes?.name || 'Cliente não encontrado',
          saleValue: parseFloat(budget.valor_total || 0),
          saleValueWithoutInstallation,
          installationFee,
          cost: totalCost,
          profit,
          margin,
          products: produtos.length,
          status: budget.status,
          produtos: produtosProcessados
        };
      })
    );

    // Calculate summary statistics
    const finalized = processedBudgets.filter(b => b.status === 'finalizado');
    const pending = processedBudgets.filter(b => b.status === 'pendente');
    const canceled = processedBudgets.filter(b => b.status === 'cancelado');

    const totalRevenue = finalized.reduce((sum, b) => sum + b.saleValue, 0);
    const totalInstallation = finalized.reduce((sum, b) => sum + b.installationFee, 0);
    const totalCosts = finalized.reduce((sum, b) => sum + b.cost, 0);
    const revenueWithoutInstallation = totalRevenue - totalInstallation;
    const totalProfit = revenueWithoutInstallation - totalCosts;
    const profitMargin = revenueWithoutInstallation > 0 ? (totalProfit / revenueWithoutInstallation) * 100 : 0;

    setSummary({
      total: processedBudgets.length,
      finalized: finalized.length,
      pending: pending.length,
      canceled: canceled.length,
      totalRevenue,
      totalInstallation,
      totalCosts,
      totalProfit,
      profitMargin,
      averageTicket: finalized.length > 0 ? totalRevenue / finalized.length : 0
    });

    setReportData(processedBudgets);
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
          <p>Total de Orçamentos: {summary.total}</p>
          <p>Finalizados: {summary.finalized}</p>
          <p>Pendentes: {summary.pending}</p>
          <p>Cancelados: {summary.canceled}</p>
        </div>
        
        <div className="summary-card">
          <h3>Desempenho Financeiro</h3>
          <p>Receita Total (com instalação): {summary.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p>Receita Total (sem instalação): {(summary.totalRevenue - summary.totalInstallation).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p>Custos Totais: {summary.totalCosts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p>Total Instalação (repasse): {summary.totalInstallation.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p>Lucro Total: {summary.totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p>Margem de Lucro: {summary.profitMargin.toFixed(2)}%</p>
          <p>Ticket Médio (sem instalação): {(summary.totalRevenue / summary.finalized - (summary.totalInstallation / summary.finalized)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </div>

      <h3>Detalhamento dos Orçamentos Finalizados</h3>
      <table className="report-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Valor Total</th>
            <th>Valor sem Instalação</th>
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
                <td>{item.saleValueWithoutInstallation.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
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
                      {item.produtos.map((prod, index) => (
                        <div key={index} className="product-detail-item">
                          <p>Produto {index + 1}:</p>
                          <p>Dimensões: {prod.largura}m x {prod.altura}m</p>
                          {prod.cost.dimensions.usedMinimum && (
                            <p>Dimensões calculadas: {prod.cost.dimensions.width.toFixed(2)}m x {prod.cost.dimensions.height.toFixed(2)}m</p>
                          )}
                          <p>Custo do Produto: {prod.cost.productCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          {prod.bando && (
                            <>
                              <p>Bandô:</p>
                              <ul>
                                <li>Custo: {prod.cost.bandoCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
                                <li>Venda: {prod.cost.bandoValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
                                <li>Lucro: {(prod.cost.bandoValue - prod.cost.bandoCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
                              </ul>
                            </>
                          )}
                          {prod.acessorios && prod.acessorios.length > 0 && (
                            <>
                              <p>Acessórios:</p>
                              <ul>
                                <li>Custo Total: {prod.cost.accessoriesCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
                                <li>Venda Total: {prod.cost.accessoriesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
                                <li>Lucro: {(prod.cost.accessoriesValue - prod.cost.accessoriesCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
                                <li>Detalhes:</li>
                                {prod.acessorios.map((acessorio, idx) => (
                                  <li key={idx} style={{marginLeft: '20px'}}>
                                    {acessorio.nome} - {acessorio.quantidade}x 
                                    - Custo un.: {parseFloat(acessorio.preco_custo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    - Venda un.: {parseFloat(acessorio.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          <p>Instalação: {prod.instalacao ? parseFloat(prod.valor_instalacao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não'}</p>
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
