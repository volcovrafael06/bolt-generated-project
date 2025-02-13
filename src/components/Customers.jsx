import React, { useState } from 'react'

function Customers({ customers, setCustomers }) {
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    cpf: '',
  })
  const [editingCustomerId, setEditingCustomerId] = useState(null)
  const [cpfErrorMessage, setCpfErrorMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const formatCpf = (cpf) => {
    const cleanedCpf = cpf.replace(/\D/g, '');
    if (cleanedCpf.length !== 11) {
      return cpf; // Return unformatted if not 11 digits
    }
    return cleanedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCustomer(prevState => ({
      ...prevState,
      [name]: ['name', 'address', 'email'].includes(name) ? value.toUpperCase() : value // Convert name, address, email to uppercase
    }))
  }

  const handleCpfChange = async (e) => {
    let cpf = e.target.value
    cpf = cpf.replace(/\D/g, '') // Remove non-numeric characters
    cpf = formatCpf(cpf) // Format the CPF
    setNewCustomer({ ...newCustomer, cpf })

    if (cpf.length === 14) {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`https://www.receitaws.com.br/v1/cpf/${cpf.replace(/\D/g, '')}`)
        const data = await response.json()

        if (data.nome) {
          setNewCustomer(prevState => ({
            ...prevState,
            name: data.nome.toUpperCase() // Fill in the name from the API
          }))
          setCpfErrorMessage('')
        } else {
          setNewCustomer(prevState => ({
            ...prevState,
            name: ''
          }))
          setCpfErrorMessage('CPF não encontrado')
        }
      } catch (error) {
        console.error('Erro ao buscar CPF:', error)
        setNewCustomer(prevState => ({
          ...prevState,
          name: ''
        }))
        setCpfErrorMessage('Erro ao buscar CPF')
      }
    } else {
      setNewCustomer(prevState => ({
        ...prevState,
        name: ''
      }))
      setCpfErrorMessage('')
    }
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
    setNewCustomer({ name: '', phone: '', email: '', address: '', cpf: '' }) // Clear form
  }

  const handleEditCustomer = (id) => {
    const customerToEdit = customers.find(customer => customer.id === id)
    if (customerToEdit) {
      setNewCustomer({
        name: customerToEdit.name,
        phone: customerToEdit.phone,
        email: customerToEdit.email,
        address: customerToEdit.address,
        cpf: customerToEdit.cpf,
      })
      setEditingCustomerId(id)
    }
  }

  const handleDeleteCustomer = (id) => {
    // const updatedCustomers = customers.filter(customer => customer.id !== id) // Don't update here
    setCustomers(customers.filter(customer => customer.id !== id)); // Update in App
  }

  const handleCancelEdit = () => {
    setNewCustomer({ name: '', phone: '', email: '', address: '', cpf: '' })
    setEditingCustomerId(null)
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toUpperCase().includes(searchTerm.toUpperCase())
  )

  return (
    <div>
      <h2>Clientes</h2>

       <div className="form-group">
          <label htmlFor="search">Buscar por Nome:</label>
          <input
            type="text"
            id="search"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome do cliente"
          />
        </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="cpf">CPF:</label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={newCustomer.cpf}
            onChange={handleCpfChange}
            maxLength="14"
          />
          {cpfErrorMessage && <p className="error-message">{cpfErrorMessage}</p>}
        </div>
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
        {filteredCustomers.map(customer => (
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
