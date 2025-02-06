import React, { useState } from 'react';

function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [newTax, setNewTax] =
