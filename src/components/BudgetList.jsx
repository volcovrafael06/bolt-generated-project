import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function BudgetList({ budgets, validadeOrcamento, onFinalizeBudget, onCancelBudget, setBudgets }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBudgets, setFilteredBudgets] = useState(budgets);

  useEffect(() => {
    setFilteredBudgets(budgets);
  }, [budgets]);

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    const filtered = budgets.filter(budget =>
      budget.customerName.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredBudgets(filtered);
  };

  const handleFinalizeBudget = (id) => {
    const updatedBudgets = budgets.map(budget =>
      budget.id === id ? { ...budget, status: 'finalizado' } : budget
    );
    setBudgets(updatedBudgets);
  };

  const handleCancelBudget = (id) => {
    const updatedBudgets = budgets.map(budget =>
      budget.id === id ? { ...budget, status: 'cancelado' } : budget
    );
    setBudgets(updatedBudgets);
  };

  return (
    <div>
      <Link to="/budgets/new">
        <button>Novo Orçamento</button>
      </Link>

      <h2>Orçamentos Existentes</h2>

      <input
        type="text"
        placeholder="Pesquisar por cliente"
        value={searchTerm}
        onChange={handleSearch}
      />

      <ul>
        {filteredBudgets && filteredBudgets.map(budget => {
          const creationDate = new Date(budget.creationDate);
          const validityDate = new Date(creationDate);
          validityDate.setDate(validityDate.getDate() + parseInt(validadeOrcamento, 10));
          const formattedCreationDate = creationDate.toLocaleDateString();
          const formattedValidityDate = validityDate.toLocaleDateString();
          const isExpired = new Date() > validityDate;
          const status = isExpired ? 'Cancelado' : budget.status;

          return (
            <li key={budget.id}>
              {budget.customerName} - Status: {status} - Total: R$ {budget.totalValue.toFixed(2)}
              <br />
              Criado em: {formattedCreationDate} - Valido até: {formattedValidityDate}
              <Link to={`/budgets/${budget.id}/view`}>
                <button>Ver</button>
              </Link>
              <Link to={`/budgets/${budget.id}/edit`}>
                <button>Editar</button>
              </Link>
              <button onClick={() => handleFinalizeBudget(budget.id)}>Finalizar</button>
              <button onClick={() => handleCancelBudget(budget.id)}>Cancelar</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default BudgetList;
