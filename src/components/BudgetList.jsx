import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BudgetList.css';

function BudgetList({ budgets, validadeOrcamento, onFinalizeBudget, onCancelBudget, onReactivateBudget }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filter = queryParams.get('filter');

  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const filteredBudgets = budgets
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter(budget => {
      if (filter === 'monthly') {
        const budgetDate = new Date(budget.created_at);
        return budgetDate.getMonth() === currentMonth && budgetDate.getFullYear() === currentYear;
      } else if (filter === 'finalized') {
        return budget.status === 'finalizado';
      }
      return true;
    })
    .filter(budget => {
      const customerName = budget.clientes?.name || '';
      return customerName.toUpperCase().includes(searchTerm.toUpperCase());
    });

  const calculateExpirationDate = (creationDate, validadeOrcamento) => {
    const creation = new Date(creationDate);
    const validityDays = parseInt(validadeOrcamento, 10);
    const expirationDate = new Date(creation.setDate(creation.getDate() + validityDays));
    return expirationDate;
  };

  const isExpired = (creationDate, validadeOrcamento) => {
    const expirationDate = calculateExpirationDate(creationDate, validadeOrcamento);
    return new Date() > expirationDate;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      <h2>Lista de Orçamentos</h2>

      <Link to="/budgets/new" className="new-budget-button">Novo Orçamento</Link>

      <div className="form-group">
        <label htmlFor="search">Buscar por Cliente:</label>
        <input
          type="text"
          id="search"
          name="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Digite o nome do cliente"
        />
      </div>

      {filteredBudgets.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Valor Total</th>
              <th>Data de Criação</th>
              <th>Válido até</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredBudgets.map(budget => (
              <tr key={budget.id}>
                <td>{budget.clientes?.name || 'Cliente não encontrado'}</td>
                <td>
                  {budget.valor_negociado ? (
                    <div>
                      {parseFloat(budget.valor_negociado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      <br/>
                      <small className="text-gray-500">
                        Original: {parseFloat(budget.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </small>
                    </div>
                  ) : (
                    parseFloat(budget.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  )}
                </td>
                <td>{formatDate(budget.created_at)}</td>
                <td>
                  {formatDate(calculateExpirationDate(budget.created_at, validadeOrcamento))}
                  {isExpired(budget.created_at, validadeOrcamento) && budget.status === 'pending' && (
                    <span className="expired-tag">EXPIRADO</span>
                  )}
                </td>
                <td>
                  <span className={`status-${budget.status === 'pending' && isExpired(budget.created_at, validadeOrcamento) ? 'expired' : budget.status || 'pending'}`}>
                    {budget.status === 'pending' && isExpired(budget.created_at, validadeOrcamento) ? 'expirado' : budget.status || 'pendente'}
                  </span>
                </td>
                <td className="action-buttons">
                  <button 
                    onClick={() => window.location.href = `/budgets/${budget.id}/view`}
                    className="action-button view-button"
                    title="Visualizar"
                  >
                    <i className="fas fa-magnifying-glass"></i>
                  </button>

                  <button 
                    onClick={() => window.location.href = `/budgets/${budget.id}/edit`}
                    className="action-button edit-button"
                    title="Editar"
                  >
                    <i className="fas fa-pencil"></i>
                  </button>

                  {budget.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => onFinalizeBudget && onFinalizeBudget(budget.id)}
                        className="action-button approve-button"
                        title="Aprovar"
                      >
                        <i className="fas fa-check"></i>
                      </button>

                      <button 
                        onClick={() => onCancelBudget && onCancelBudget(budget.id)}
                        className="action-button cancel-button"
                        title="Cancelar"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </>
                  )}

                  {budget.status === 'cancelado' && (
                    <button 
                      onClick={() => onReactivateBudget && onReactivateBudget(budget.id)}
                      className="action-button reactivate-button"
                      title="Reativar"
                    >
                      <i className="fas fa-rotate-left"></i>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum orçamento encontrado.</p>
      )}
    </div>
  );
}

export default BudgetList;
