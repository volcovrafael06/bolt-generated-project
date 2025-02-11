import React from 'react';
import Dashboard from './Dashboard';
import VisitScheduler from './VisitScheduler';

function HomePage({ budgets, customers, visits, setVisits }) {
  return (
    <div>
      <h1>Bem-vindo!</h1>
      <Dashboard budgets={budgets} customers={customers} visits={visits} />
      <VisitScheduler visits={visits} setVisits={setVisits} />
    </div>
  );
}

export default HomePage;
