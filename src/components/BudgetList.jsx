import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function BudgetList({ budgets, validadeOrcamento }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filter = queryParams.get('filter');

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const filteredBudgets = budgets.filter(budget => {
    if (filter === 'monthly') {
      const budgetDate = new Date(budget.creationDate);
      return budgetDate.getMonth() === currentMonth && budgetDate.getFullYear() === currentYear;
    } else if (filter === 'finalized') {
      return budget.status === 'finalizado';
    }
    return true;
  });

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
                <td>{budget.status}</td>
                <td>
                  <Link to={`/budgets/${budget.id}/view`}>Visualizar</Link> |
                  <Link to={`/budgets/${budget.id}/edit`}>Editar</Link>
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
