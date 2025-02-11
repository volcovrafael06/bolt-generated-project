import React, { useState, useEffect } from 'react';
import VisitScheduler from './VisitScheduler';
import Dashboard from './Dashboard';

function HomePage({ budgets, customers, visits }) {
  return (
    <div>
      <h2>Agendamentos e Visitas para Orçamento</h2>
      <Dashboard budgets={budgets} customers={customers} visits={visits} />
      <VisitScheduler />
    </div>
  );
}

export default HomePage;
