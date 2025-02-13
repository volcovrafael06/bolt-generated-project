import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function BudgetList({ budgets, validadeOrcamento, onFinalizeBudget, onCancelBudget }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filter = queryParams.get('filter');

  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const filteredBudgets = budgets
    .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate))
    .filter(budget => {
      if (filter === 'monthly') {
        const budgetDate = new Date(budget.creationDate);
        return budgetDate.getMonth() === currentMonth && budgetDate.getFullYear() === currentYear;
      } else if (filter === 'finalized') {
        return budget.status === 'finalizado';
      }
      return true;
    })
    .filter(budget =>
      budget.customerName.toUpperCase().includes(searchTerm.toUpperCase())
    );

  const calculateExpirationDate = (creationDate, validadeOrcamento) => {
    const creation = new Date(creationDate);
    const validityDays = parseInt(validadeOrcamento, 10);
    const expirationDate = new Date(creation.setDate(creation.getDate() + validityDays));
    return expirationDate.toLocaleDateString();
  };

  return (
    <div>
      <h2>Lista de Orçamentos</h2>

      <Link to="/budgets/new">Novo Orçamento</Link>

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
                <td>{budget.customerName}</td>
                <td>{budget.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>{new Date(budget.creationDate).toLocaleDateString()}</td>
                <td>{calculateExpirationDate(budget.creationDate, validadeOrcamento)}</td>
                <td>{budget.status}</td>
                <td>
                  <Link to={`/budgets/${budget.id}/view`}>Visualizar</Link> |
                  <Link to={`/budgets/${budget.id}/edit`}>Editar</Link> |
                  {budget.status !== 'finalizado' && (
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
    </div>
  );
}

export default BudgetList;
