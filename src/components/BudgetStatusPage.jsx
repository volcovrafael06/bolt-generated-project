import React from 'react';
import BudgetList from './BudgetList'; // Import BudgetList component

function BudgetStatusPage({ budgets, setBudgets, validadeOrcamento }) { // Receive setBudgets and validadeOrcamento as props
  // Function to finalize a budget
  const handleFinalizeBudget = (budgetId) => {
    const updatedBudgets = budgets.map(budget =>
      budget.id === budgetId ? { ...budget, status: 'finalizado' } : budget
    );
    setBudgets(updatedBudgets);
    alert(`Orçamento ${budgetId} finalizado.`);
  };

  // Function to cancel a budget
  const handleCancelBudget = (budgetId) => {
    const updatedBudgets = budgets.map(budget =>
      budget.id === budgetId ? { ...budget, status: 'cancelado' } : budget
    );
    setBudgets(updatedBudgets);
    alert(`Orçamento ${budgetId} cancelado.`);
  };

  return (
    <div>
      <h2>Status dos Orçamentos</h2>
      <BudgetList
        budgets={budgets}
        validadeOrcamento={validadeOrcamento}
        onFinalizeBudget={handleFinalizeBudget} // Pass handleFinalizeBudget as prop
        onCancelBudget={handleCancelBudget} // Pass handleCancelBudget as prop
      />
    </div>
  );
}

export default BudgetStatusPage;
