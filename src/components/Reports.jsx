import React, { useState, useEffect } from 'react';
import './Reports.css';

function Reports() {
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    // Fetch and process data based on the selected period
    const fetchData = async () => {
      // Placeholder for fetching data from a data source
      const salesData = [
        { id: 1, customerName: 'Cliente A', saleValue: 1000, installationFee: 100, cost: 600 },
        { id: 2, customerName: 'Cliente B', saleValue: 1500, installationFee: 150, cost: 900 },
        { id: 3, customerName: 'Cliente C', saleValue: 2000, installationFee: 200, cost: 1200 },
      ];

      // Calculate profit for each sale
      const processedData = salesData.map(sale => ({
        ...sale,
        profit: sale.saleValue + sale.installationFee - sale.cost,
      }));

      setReportData(processedData);
    };

    fetchData();
  }, [period, startDate, endDate]);

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  return (
    <div className="reports-container">
      <h2>Relatórios</h2>

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
            <input type="date" id="startDate" value={startDate} onChange={handleStartDateChange} />

            <label htmlFor="endDate">Data de Término:</label>
            <input type="date" id="endDate" value={endDate} onChange={handleEndDateChange} />
          </>
        )}
      </div>

      <table className="report-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Valor da Venda</th>
            <th>Taxa de Instalação</th>
            <th>Custo</th>
            <th>Lucro</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map(item => (
            <tr key={item.id}>
              <td>{item.customerName}</td>
              <td>{item.saleValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td>{item.installationFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td>{item.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td>{item.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Reports;
