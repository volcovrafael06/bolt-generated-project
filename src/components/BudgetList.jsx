import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function BudgetList({ budgets, validadeOrcamento, onFinalizeBudget, onCancelBudget }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filter = queryParams.get('filter');

  const [updatedBudgets, setUpdatedBudgets] = useState(budgets);

  useEffect(() => {
    const checkAndCancelExpiredBudgets = () => {
      const today = new Date();
      const updated = updatedBudgets.map(budget => {
        const expirationDate = new Date(budget.creationDate);
        expirationDate.setDate(expirationDate.getDate() + parseInt(validadeOrcamento, 10));
        if (expirationDate < today && budget.status !== 'finalizado' && budget.status !== 'cancelado') {
          // Cancel the budget if it's expired and not already finalized or canceled
          if (onCancelBudget) {
            onCancelBudget(budget.id);
          }
          return { ...budget, status: 'cancelado' };
        }
        return budget;
      });
      setUpdatedBudgets(updated);
    };

    checkAndCancelExpiredBudgets();
  }, [budgets, validadeOrcamento, onCancelBudget]);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const filteredBudgets = updatedBudgets.filter(budget => {
    if (filter === 'monthly') {
      const budgetDate = new Date(budget.creationDate);
      return budgetDate.getMonth() === currentMonth && budgetDate.getFullYear() === currentYear;
    } else if (filter === 'finalized') {
      return budget.status === 'finalizado';
    }
    return true;
  });

  const calculateExpirationDate = (creationDate, validadeOrcamento) => {
    const creation = new Date(creationDate);
    const validityDays = parseInt(validadeOrcamento, 10);
    const expirationDate = new Date(creation.setDate(creation.getDate() + validityDays));
    return expirationDate.toLocaleDateString();
  };

  return (
    <div>
      <h2>Lista de Orçamentos</h2>
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
                <td>{budget.customerName}</td>
                <td>{budget.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>{new Date(budget.creationDate).toLocaleDateString()}</td>
                <td>{calculateExpirationDate(budget.creationDate, validadeOrcamento)}</td>
                <td>{budget.status}</td>
                <td>
                  <Link to={`/budgets/${budget.id}/view`}>Visualizar</Link> |
                  <Link to={`/budgets/${budget.id}/edit`}>Editar</Link> |
                  {budget.status !== 'finalizado' && budget.status !== 'cancelado' && (
                    <>
                      <button onClick={() => onFinalizeBudget && onFinalizeBudget(budget.id)}>Finalizar</button> |
                      <button onClick={() => onCancelBudget && onCancelBudget(budget.id)}>Cancelar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum orçamento encontrado.</p>
      )}
      <Link to="/budgets/new">Novo Orçamento</Link>
    </div>
  );
}

export default BudgetList;
