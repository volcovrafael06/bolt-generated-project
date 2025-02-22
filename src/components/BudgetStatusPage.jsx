import React from 'react';
import VisitScheduler from './VisitScheduler'; 
import BudgetList from './BudgetList';
import { supabase } from '../supabase/client';

function BudgetStatusPage({ budgets, setBudgets, validadeOrcamento }) {
  // Function to finalize a budget
  const handleFinalizeBudget = async (budgetId) => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({ status: 'finalizado' })
        .eq('id', budgetId);

      if (error) throw error;

      const updatedBudgets = budgets.map(budget =>
        budget.id === budgetId ? { ...budget, status: 'finalizado' } : budget
      );
      setBudgets(updatedBudgets);
      alert(`Orçamento ${budgetId} finalizado.`);
    } catch (error) {
      console.error('Error finalizing budget:', error);
      alert('Erro ao finalizar orçamento.');
    }
  };

  // Function to cancel a budget
  const handleCancelBudget = async (budgetId) => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({ status: 'cancelado' })
        .eq('id', budgetId);

      if (error) throw error;

      const updatedBudgets = budgets.map(budget =>
        budget.id === budgetId ? { ...budget, status: 'cancelado' } : budget
      );
      setBudgets(updatedBudgets);
      alert(`Orçamento ${budgetId} cancelado.`);
    } catch (error) {
      console.error('Error canceling budget:', error);
      alert('Erro ao cancelar orçamento.');
    }
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
