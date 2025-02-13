import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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

  return (
    <div className="budget-details-container">
      <header className="budget-header">
        {companyLogo && (
          <img src={companyLogo} alt="Company Logo" className="company-logo" />
        )}
        <div className="company-info">
          <p>Tel.: {configuracoes.telefone || 'N/A'}</p>
          <p>{configuracoes.endereco || 'N/A'}</p>
          <p>{configuracoes.nomeFantasia || 'N/A'}</p>
          <p>CNPJ: {configuracoes.cnpj || 'N/A'}</p>
        </div>
        <div className="budget-info">
          <p>Criado em: {formattedCreationDate}</p>
          <p>Orçamento Nº: {budget.id}</p>
        </div>
      </header>

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
                    {item.type === 'product' ? (item.item?.calculationMethod === 'm2' ? `${item.length} x ${item.height} m²` : '1') : '1'}
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

      <button onClick={handlePrint}>Imprimir</button>
    </div>
  );
}

export default BudgetDetailsPage;
