import React from 'react';
import { Link } from 'react-router-dom';

function BudgetList({ budgets, validadeOrcamento }) { // Adicionado validadeOrcamento como prop

  const handleViewBudget = (budgetId) => {
    alert(`Visualizar Orçamento ID: ${budgetId}`);
    // In a real app, you would navigate to a "view budget" page
  };

  const handleEditBudget = (budgetId) => {
    alert(`Editar Orçamento ID: ${budgetId}`);
    // In a real app, you would navigate to an "edit budget" page
  };

  const handleFinalizeBudget = (budgetId) => {
    alert(`Finalizar Orçamento ID: ${budgetId}`);
    // In a real app, you would update the budget status to "finalized"
  };

  const handleCancelBudget = (budgetId) => {
    alert(`Cancelar Orçamento ID: ${budgetId}`);
    // In a real app, you would update the budget status to "cancelled"
  };


  return (
    <div>
      <Link to="/budgets/new">
        <button>Novo Orçamento</button>
      </Link>

      <h2>Orçamentos Existentes</h2>
      <ul>
        {budgets.map(budget => {
          const creationDate = new Date(budget.creationDate); // Assuming creationDate is stored as a string or timestamp
          const validityDate = new Date(creationDate);
          validityDate.setDate(validityDate.getDate() + parseInt(validadeOrcamento, 10)); // Usando validadeOrcamento
          const formattedCreationDate = creationDate.toLocaleDateString();
          const formattedValidityDate = validityDate.toLocaleDateString();
          const isExpired = new Date() > validityDate;
          const status = isExpired ? 'Cancelado' : budget.status;


          return (
            <li key={budget.id}>
              {budget.customerName} - Status: {status} - Total: R$ {budget.totalValue.toFixed(2)}
              <br />
              Criado em: {formattedCreationDate} - Valido até: {formattedValidityDate}
              <button onClick={() => handleViewBudget(budget.id)}>Ver</button>
              <button onClick={() => handleEditBudget(budget.id)}>Editar</button>
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
