import React from 'react';

function BudgetStatusPage({ budgets }) {
  return (
    <div>
      <h2>Budget Status</h2>
      <ul>
        {budgets.map(budget => (
          <li key={budget.id}>
            {budget.customerName} - Status: {budget.status} - Total: R$ {budget.totalValue.toFixed(2)}
            <button onClick={() => alert('View Budget')}>Ver</button>
            <button onClick={() => alert('Edit Budget')}>Editar</button>
            <button onClick={() => alert('Finalize Budget')}>Finalizar</button>
            <button onClick={() => alert('Cancel Budget')}>Cancelar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BudgetStatusPage;
