import React, { useState, useEffect } from 'react'
import { clienteService } from '../services/clienteService'

function Customers() {
  const [customers, setCustomers] = useState([])
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await clienteService.getAll()
      setCustomers(data)
    } catch (err) {
      setError('Erro ao carregar clientes: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCustomer(prev => ({
      ...prev,
      [name]: ['name', 'address', 'email'].includes(name) ? value.toUpperCase() : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newCustomer.name.trim()) {
      alert('Nome do cliente é obrigatório.')
      return
    }

    try {
      if (editingCustomerId) {
        await clienteService.update(editingCustomerId, newCustomer)
      } else {
        await clienteService.create(newCustomer)
      }
      
      loadCustomers()
      setNewCustomer({ name: '', phone: '', email: '', address: '', cpf: '' })
      setEditingCustomerId(null)
    } catch (err) {
      setError('Erro ao salvar cliente: ' + err.message)
    }
  }

  const handleEditCustomer = (customer) => {
    setNewCustomer({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      cpf: customer.cpf,
    })
    setEditingCustomerId(customer.id)
  }

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await clienteService.delete(id)
        loadCustomers()
      } catch (err) {
        setError('Erro ao excluir cliente: ' + err.message)
      }
    }
  }

  const handleCancelEdit = () => {
    setNewCustomer({ name: '', phone: '', email: '', address: '', cpf: '' })
    setEditingCustomerId(null)
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toUpperCase().includes(searchTerm.toUpperCase())
  )

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>

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
            onChange={handleInputChange}
            maxLength="14"
          />
          {cpfErrorMessage && <p className="error-message">{cpfErrorMessage}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="name">Nome:</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={newCustomer.name} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Telefone:</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone" 
            value={newCustomer.phone} 
            onChange={handleInputChange} 
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={newCustomer.email} 
            onChange={handleInputChange} 
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Endereço:</label>
          <input 
            type="text" 
            id="address" 
            name="address" 
            value={newCustomer.address} 
            onChange={handleInputChange} 
          />
        </div>
        <div className="form-actions">
          <button type="submit">
            {editingCustomerId ? 'Salvar Edição' : 'Adicionar Cliente'}
          </button>
          {editingCustomerId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancelar Edição
            </button>
          )}
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
              <button onClick={() => handleEditCustomer(customer)}>Editar</button>
              <button onClick={() => handleDeleteCustomer(customer.id)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Customers
