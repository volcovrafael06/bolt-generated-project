import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './BudgetDetailsPage.css';

function BudgetDetailsPage({ budgets, companyLogo }) {
  const { budgetId } = useParams();
  const budget = budgets.find(budget => budget.id === parseInt(budgetId, 10));
  const [configuracoes, setConfiguracoes] = useState({});
  const [showModal, setShowModal] = useState(false);

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

  const BudgetModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <button onClick={() => setShowModal(false)} className="close-button">×</button>
        </div>
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
        <div className="modal-footer">
          <button onClick={handlePrint} className="print-button">Imprimir</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="budget-details-container">
      <h2>Detalhes do Orçamento</h2>
      <button onClick={() => setShowModal(true)} className="view-button">
        Visualizar Orçamento
      </button>
      {showModal && <BudgetModal />}
    </div>
  );
}

export default BudgetDetailsPage;
