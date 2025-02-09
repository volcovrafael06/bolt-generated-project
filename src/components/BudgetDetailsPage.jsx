import React from 'react';
import { useParams } from 'react-router-dom';

function BudgetDetailsPage({ budgets }) {
  const { budgetId } = useParams();
  const budget = budgets.find(budget => budget.id === parseInt(budgetId, 10));

  if (!budget) {
    return <p>Orçamento não encontrado.</p>;
  }

  const creationDate = new Date(budget.creationDate);
  const formattedCreationDate = creationDate.toLocaleDateString();

  return (
    <div>
      <h2>Detalhes do Orçamento</h2>
      <p><strong>Cliente:</strong> {budget.customerName}</p>
      <p><strong>Status:</strong> {budget.status}</p>
      <p><strong>Total:</strong> R$ {budget.totalValue.toFixed(2)}</p>
      <p><strong>Criado em:</strong> {formattedCreationDate}</p>

      <h3>Itens do Orçamento</h3>
      {budget.items && budget.items.length > 0 ? (
        <ul>
          {budget.items.map((item, index) => (
            <li key={index}>
              {item.type === 'product' ? (
                `${item.item.name} - ${item.item.model} - Comprimento: ${item.length} - Altura: ${item.height} - Preço: ${item.price ? item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}`
              ) : (
                `${item.item.name} - Acessório - Preço: ${item.price ? item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}`
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum item neste orçamento.</p>
      )}
    </div>
  );
}

export default BudgetDetailsPage;
