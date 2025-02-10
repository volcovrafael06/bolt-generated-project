import React from 'react';
import VisitScheduler from './VisitScheduler'; // Certifique-se de que esta importação está correta
import BudgetList from './BudgetList';

function BudgetStatusPage({ budgets, setBudgets, validadeOrcamento }) {
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
      <h2>Agendamentos e Visitas para Orçamento</h2>
      <VisitScheduler /> {/* Render VisitScheduler component here */}
      <br/>
      <h2>Orçamentos Existentes</h2>
      <BudgetList
        budgets={budgets}
        validadeOrcamento={validadeOrcamento}
        onFinalizeBudget={handleFinalizeBudget}
        onCancelBudget={handleCancelBudget}
      />
    </div>
  );
}

export default BudgetStatusPage;
