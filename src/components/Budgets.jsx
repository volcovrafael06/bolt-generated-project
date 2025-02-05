import React, { useState } from 'react'
import jsPDF from 'jspdf'

const productModels = {
  Cortina: ['Double Vision', 'Double Vision Large', 'Double Vision Mônaco BK', 'Double Vision Screen', 'Double Vision Semi BK', 'Romana', 'Wave', 'Painel'],
  Persiana: ['Horizontal', 'Vertical'],
}

function Budgets({ customers, products }) {
  const [budgetItems, setBudgetItems] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [budgetSummary, setBudgetSummary] = useState(null)

  const handleAddItem = () => {
    setBudgetItems([...budgetItems, { category: '', model: '', productId: '', quantity: 1, length: '', height: '', cor: '' }])
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...budgetItems]
    updatedItems[index][field] = value

    if (field === 'category') {
      updatedItems[index].model = '';
      updatedItems[index].productId = '';
    }
    if (field === 'model') {
      updatedItems[index].productId = '';
    }
    if (field === 'quantity') {
      updatedItems[index][field] = Math.max(1, parseInt(value, 10));
    }
    setBudgetItems(updatedItems)
  }

  const calculateBudget = () => {
    let subtotal = 0
    const itemsDetails = budgetItems.map(item => {
      // Find product based on category and model
      const product = products.find(p => p.category === item.category && p.model === item.model);

      if (product) {
        let area = 0;
        let itemTotal = 0;
        if (product.model === 'Wave') {
          itemTotal = product.price * parseFloat(item.length) * parseFloat(item.quantity);
          area = parseFloat(item.length);
        } else {
          area = parseFloat(item.length) * parseFloat(item.height) * parseFloat(item.quantity);
          itemTotal = area * product.price;
        }
        subtotal += itemTotal;
        return {
          productName: `${product.category} ${product.model} - ${product.name} - Cor: ${item.cor}`, // Include full product name
          quantity: item.quantity,
          length: item.length,
          height: item.height,
          area: area.toFixed(2),
          itemTotal: itemTotal.toFixed(2),
          cor: item.cor,
        };
      }
      return null;
    }).filter(item => item !== null);

    let discount = 0
    if (paymentMethod === 'avista') {
      discount = subtotal * 0.10
    }

    const total = subtotal - discount

    setBudgetSummary({
      items: itemsDetails,
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
      paymentMethod: paymentMethod,
    })
  }

  const generatePDF = () => {
    if (!budgetSummary) return

    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('Resumo do Orçamento PersiFIX', 10, 10)
    doc.setFontSize(12)
    let y = 30

    budgetSummary.items.forEach(item => {
      doc.text(`Produto: ${item.productName}`, 10, y)
      y += 10
      doc.text(`  Quantidade: ${item.quantity}, Comprimento: ${item.length}m, Altura: ${item.height}m, Área: ${item.area}m²`, 10, y)
      y += 10
      doc.text(`  Total Item: R$ ${item.itemTotal}`, 10, y)
      y += 10
    })

    doc.text(`Subtotal: R$ {budgetSummary.subtotal}`, 10, y + 10)
    doc.text(`Desconto (${budgetSummary.paymentMethod === 'avista' ? '10% à vista' : 'Nenhum'}): R$ {budgetSummary.discount}`, 10, y + 20)
    doc.text(`Total: R$ {budgetSummary.total}`, 10, y + 30)
    doc.text(`Forma de Pagamento: {budgetSummary.paymentMethod === 'avista' ? 'À Vista' : 'Parcelado'}`, 10, y + 40)

    doc.save('orcamento_persifix.pdf')
  }

  return (
    <div>
      <h2>Orçamentos</h2>

      <div className="form-group">
        <label htmlFor="customer">Cliente:</label>
        <select id="customer" name="customer" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
          <option value="">Selecione um cliente</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
      </div>

      <h3>Itens do Orçamento</h3>
      {budgetItems.map((item, index) => (
        <div key={index} className="budget-item">
          <div className="form-group">
            <label htmlFor={`category-${index}`}>Categoria:</label>
            <select id={`category-${index}`} name="category" value={item.category} onChange={(e) => handleItemChange(index, 'category', e.target.value)}>
              <option value="">Selecione a Categoria</option>
              <option value="Cortina">Cortina</option>
              <option value="Persiana">Persiana</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor={`model-${index}`}>Modelo:</label>
            <select id={`model-${index}`} name="model" value={item.model} onChange={(e) => handleItemChange(index, 'model', e.target.value)} disabled={!item.category}>
              <option value="">Selecione o Modelo</option>
              {item.category && productModels[item.category].map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor={`product-${index}`}>Produto:</label>
            <select id={`product-${index}`} name="productId" value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} disabled={!item.model}>
              <option value="">Selecione o Produto</option>
              {products.filter(p => p.category === item.category && p.model === item.model).map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor={`quantity-${index}`}>Quantidade:</label>
            <input
              type="number"
              id={`quantity-${index}`}
              name="quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              min="1"
            />
          </div>
          <div className="form-group">
            <label htmlFor={`length-${index}`}>Comprimento (m):</label>
            <input type="number" id={`length-${index}`} name="length" value={item.length} onChange={(e) => handleItemChange(index, 'length', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor={`height-${index}`}>Altura (m):</label>
            <input type="number" id={`height-${index}`} name="height" value={item.height} onChange={(e) => handleItemChange(index, 'height', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor={`cor-${index}`}>Cor:</label>
            <input type="text" id={`cor-${index}`} name="cor" value={item.cor} onChange={(e) => handleItemChange(index, 'cor', e.target.value)} />
          </div>
        </div>
      ))}
      <button type="button" onClick={handleAddItem}>Adicionar Item</button>

      <div className="form-group">
        <label htmlFor="paymentMethod">Forma de Pagamento:</label>
        <select id="paymentMethod" name="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="">Selecione a forma de pagamento</option>
          <option value="avista">À Vista</option>
          <option value="parcelado">Parcelado (até 12x)</option>
        </select>
      </div>

      <button type="button" onClick={calculateBudget}>Calcular Orçamento</button>
      <button type="button" onClick={generatePDF} disabled={!budgetSummary}>Gerar PDF</button>

      {budgetSummary && (
        <div className="budget-summary">
          <h3>Resumo do Orçamento</h3>
          <ul>
            {budgetSummary.items.map((item, index) => (
              <li key={index}>
                {item.productName} - Quantidade: {item.quantity}, Comprimento: {item.length}m, Altura: {item.height}m, Área: {item.area}m², Total Item: R$ {item.itemTotal} , Cor: {item.cor}
              </li>
            ))}
          </ul>
          <p>Subtotal: R$ {budgetSummary.subtotal}</p>
          <p>Desconto ({budgetSummary.paymentMethod === 'avista' ? '10% à vista' : 'Nenhum'}): R$ {budgetSummary.discount}</p>
          <p>Total: R$ {budgetSummary.total}</p>
          <p>Forma de Pagamento: {budgetSummary.paymentMethod === 'avista' ? 'À Vista' : 'Parcelado'}</p>
        </div>
      )}
    </div>
  )
}

export default Budgets
