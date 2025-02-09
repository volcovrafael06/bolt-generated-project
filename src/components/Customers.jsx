import React, { useState } from 'react'

function Customers({ customers, setCustomers }) {
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  })
  const [editingCustomerId, setEditingCustomerId] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCustomer(prevState => ({
      ...prevState,
      [name]: ['name', 'address', 'email'].includes(name) ? value.toUpperCase() : value // Convert name, address, email to uppercase
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newCustomer.name.trim()) {
      alert('Nome do cliente é obrigatório.')
      return
    }

    let updatedCustomers
    if (editingCustomerId) {
      updatedCustomers = customers.map(customer =>
        customer.id === editingCustomerId ? { ...customer, ...newCustomer, id: editingCustomerId } : customer
      )
      setEditingCustomerId(null)
    } else {
      const nextId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1
      updatedCustomers = [...customers, { ...newCustomer, id: nextId }]
    }
     setCustomers(updatedCustomers); // Update customers in App component
    setNewCustomer({ name: '', phone: '', email: '', address: '' }) // Clear form
  }

  const handleEditCustomer = (id) => {
    const customerToEdit = customers.find(customer => customer.id === id)
    if (customerToEdit) {
      setNewCustomer({
        name: customerToEdit.name,
        phone: customerToEdit.phone,
        email: customerToEdit.email,
        address: customerToEdit.address,
      })
      setEditingCustomerId(id)
    }
  }

  const handleDeleteCustomer = (id) => {
    // const updatedCustomers = customers.filter(customer => customer.id !== id) // Don't update here
    setCustomers(customers.filter(customer => customer.id !== id)); // Update in App
  }

  const handleCancelEdit = () => {
    setNewCustomer({ name: '', phone: '', email: '', address: '' })
    setEditingCustomerId(null)
  }

  return (
    <div>
      <h2>Clientes</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nome:</label>
          <input type="text" id="name" name="name" value={newCustomer.name} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Telefone:</label>
          <input type="tel" id="phone" name="phone" value={newCustomer.phone} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={newCustomer.email} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label htmlFor="address">Endereço:</label>
          <input type="text" id="address" name="address" value={newCustomer.address} onChange={handleInputChange} />
        </div>
        <div className="form-actions">
          <button type="submit">{editingCustomerId ? 'Salvar Edição' : 'Adicionar Cliente'}</button>
          {editingCustomerId && <button type="button" onClick={handleCancelEdit}>Cancelar Edição</button>}
        </div>
      </form>

      <h3>Lista de Clientes</h3>
      <ul className="customer-list">
        {customers.map(customer => (
          <li key={customer.id} className="customer-item">
            <strong>{customer.name}</strong> <br />
            Telefone: {customer.phone} <br />
            Email: {customer.email} <br />
            Endereço: {customer.address}
            <div className="customer-actions">
              <button onClick={() => handleEditCustomer(customer.id)}>Editar</button>
              <button onClick={() => handleDeleteCustomer(customer.id)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Customers
