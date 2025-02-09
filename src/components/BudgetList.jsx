import React from 'react';
import { Link } from 'react-router-dom';

function BudgetList({ budgets, validadeOrcamento, onFinalizeBudget, onCancelBudget }) {

  return (
    <div>
      <Link to="/budgets/new">
        <button>Novo Orçamento</button>
      </Link>

      <h2>Orçamentos Existentes</h2>
      <ul>
        {budgets.map(budget => {
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
              <Link to={`/budgets/${budget.id}/edit`}> {/* Link to edit route */}
                <button>Editar</button>
              </Link>
              <button onClick={() => onFinalizeBudget(budget.id)} >Finalizar</button>
              <button onClick={() => onCancelBudget(budget.id)} >Cancelar</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default BudgetList;
