import React, { useState } from 'react'

const initialProductHierarchy = {
  'Persiana de Rolo': {
    'TECIDO DOUBLE VISION': {
      'DOUBLE VISION': ['40010-40015', '40009-40018'],
      'DOUBLE VISION LARGE': ['40021-40026', '40027-40030']
    }
  },
  'Cortina': {
    'LINHO': {
      'ROMANA': ['CR-LI-BG', 'CR-LI-WH'],
      'PAINEL': ['CP-PA-CR', 'CP-PA-GY']
    },
    'SEDA': {
      'WAVE': ['CW-SE-CZ', 'CW-SE-RD']
    }
  }
};

const categoriesList = Object.keys(initialProductHierarchy);

function Products({ products, setProducts }) {
  const [productHierarchy, setProductHierarchy] = useState(initialProductHierarchy);
  const [newProduct, setNewProduct] = useState({
    referenceCode: '',
    category: '',
    material: '',
    model: '',
    color: '',
    price: '',
    cost: '',
    largura: '',
  })
  const [editingProductId, setEditingProductId] = useState(null)
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [availableReferenceCodes, setAvailableReferenceCodes] = useState([]);
  const [showNewInput, setShowNewInput] = useState({ category: false, material: false, model: false, referenceCode: false });
  const [hierarchyInputValues, setHierarchyInputValues] = useState({ category: '', material: '', model: '', referenceCode: '' });


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (name === 'category') {
      setAvailableMaterials(Object.keys(productHierarchy[value] || {}));
      setAvailableModels([]);
      setAvailableReferenceCodes([]);
      setNewProduct(prevState => ({ ...prevState, material: '', model: '', referenceCode: '' }));
    } else if (name === 'material') {
      setAvailableModels(Object.keys(productHierarchy[newProduct.category]?.[value] || {}));
      setAvailableReferenceCodes([]);
      setNewProduct(prevState => ({ ...prevState, model: '', referenceCode: '' }));
    } else if (name === 'model') {
      setAvailableReferenceCodes(productHierarchy[newProduct.category]?.[newProduct.material]?.[value] || []);
      setNewProduct(prevState => ({ ...prevState, referenceCode: '' }));
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newProduct.referenceCode.trim()) {
      alert('Código de referência do produto é obrigatório.')
      return
    }

    if (editingProductId) {
      const updatedProducts = products.map(product =>
        product.id === editingProductId ? { ...product, ...newProduct, id: editingProductId } : product
      )
      setProducts(updatedProducts)
      setEditingProductId(null)
    } else {
      const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1
      setProducts([...products, { id: nextId, ...newProduct }])
    }
    setNewProduct({ referenceCode: '', category: '', material: '', model: '', color: '', price: '', cost: '', largura: '' })
  }

  const handleEditProduct = (id) => {
    const productToEdit = products.find(product => product.id === id)
    if (productToEdit) {
      setNewProduct({
        referenceCode: productToEdit.referenceCode,
        category: productToEdit.category,
        material: productToEdit.material,
        model: productToEdit.model,
        color: productToEdit.color,
        price: productToEdit.price,
        cost: productToEdit.cost,
        largura: productToEdit.largura,
      })
      setEditingProductId(id)
      setAvailableMaterials(Object.keys(productHierarchy[productToEdit.category] || {}));
      setAvailableModels(Object.keys(productHierarchy[productToEdit.category]?.[productToEdit.material] || {}));
      setAvailableReferenceCodes(productHierarchy[productToEdit.category]?.[productToEdit.material]?.[productToEdit.model] || []);
    }
  }

  const handleDeleteProduct = (id) => {
    const updatedProducts = products.filter(product => product.id !== id)
    setProducts(updatedProducts)
  }

  const handleCancelEdit = () => {
    setNewProduct({ referenceCode: '', category: '', material: '', model: '', color: '', price: '', cost: '', largura: '' })
    setEditingProductId(null)
    setAvailableMaterials([]);
    setAvailableModels([]);
    setAvailableReferenceCodes([]);
  }

  const handleAddHierarchyItem = (level) => {
    setShowNewInput({...showNewInput, [level]: true});
  }

  const handleSaveHierarchyItem = (level) => {
    const newItemName = hierarchyInputValues[level];
    if (!newItemName) return;

    let updatedHierarchy = {...productHierarchy};
    switch (level) {
      case 'category':
        if (!updatedHierarchy[newItemName]) updatedHierarchy[newItemName] = {};
        setProductHierarchy(updatedHierarchy);
        setAvailableMaterials(Object.keys(updatedHierarchy));
        setNewProduct({...newProduct, category: newItemName});
        break;
      case 'material':
        if (!updatedHierarchy[newProduct.category][newItemName]) updatedHierarchy[newProduct.category][newItemName] = {};
        setProductHierarchy(updatedHierarchy);
        setAvailableMaterials(Object.keys(updatedHierarchy[newProduct.category]));
        setAvailableModels(Object.keys(updatedHierarchy[newProduct.category][newItemName]));
        setNewProduct({...newProduct, material: newItemName});
        break;
      case 'model':
        if (!updatedHierarchy[newProduct.category][newProduct.material][newItemName]) updatedHierarchy[newProduct.category][newProduct.material][newItemName] = [];
        setProductHierarchy(updatedHierarchy);
        setAvailableModels(Object.keys(updatedHierarchy[newProduct.category][newProduct.material]));
        setAvailableReferenceCodes(updatedHierarchy[newProduct.category][newProduct.material][newItemName]);
        setNewProduct({...newProduct, model: newItemName});
        break;
      case 'referenceCode':
        updatedHierarchy[newProduct.category][newProduct.material][newProduct.model].push(newItemName);
        setProductHierarchy(updatedHierarchy);
        setAvailableReferenceCodes(updatedHierarchy[newProduct.category][newProduct.material][newProduct.model]);
        setNewProduct({...newProduct, referenceCode: newItemName});
        break;
      default:
        return;
    }
    setShowNewInput({...showNewInput, [level]: false});
    setHierarchyInputValues({...hierarchyInputValues, [level]: ''});
  };

  const handleHierarchyInputChange = (e) => {
    setHierarchyInputValues({...hierarchyInputValues, [e.target.name]: e.target.value});
  };


  return (
    <div>
      <h2>Produtos</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group hierarchy-group">
          <label htmlFor="category">Categoria:</label>
          <select id="category" name="category" value={newProduct.category} onChange={handleInputChange} required>
            <option value="">Selecione a Categoria</option>
            {categoriesList.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button type="button" className="add-hierarchy-button" onClick={() => handleAddHierarchyItem('category')}>+</button>
          {showNewInput.category && (
            <div className="inline-input">
              <input type="text" name="category" placeholder="Nova Categoria" value={hierarchyInputValues.category} onChange={handleHierarchyInputChange}/>
              <button type="button" onClick={() => handleSaveHierarchyItem('category')}>Salvar</button>
            </div>
          )}
        </div>
        <div className="form-group hierarchy-group">
          <label htmlFor="material">Material:</label>
          <select id="material" name="material" value={newProduct.material} onChange={handleInputChange} required disabled={!newProduct.category}>
            <option value="">Selecione o Material</option>
            {availableMaterials.map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
           <button type="button" className="add-hierarchy-button" onClick={() => handleAddHierarchyItem('material')} disabled={!newProduct.category}>+</button>
          {showNewInput.material && (
            <div className="inline-input">
              <input type="text" name="material" placeholder="Novo Material" value={hierarchyInputValues.material} onChange={handleHierarchyInputChange}/>
              <button type="button" onClick={() => handleSaveHierarchyItem('material')}>Salvar</button>
            </div>
          )}
        </div>
        <div className="form-group hierarchy-group">
          <label htmlFor="model">Modelo:</label>
          <select id="model" name="model" value={newProduct.model} onChange={handleInputChange} required disabled={!newProduct.material}>
            <option value="">Selecione o Modelo</option>
            {availableModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
           <button type="button" className="add-hierarchy-button" onClick={() => handleAddHierarchyItem('model')} disabled={!newProduct.material}>+</button>
          {showNewInput.model && (
            <div className="inline-input">
              <input type="text" name="model" placeholder="Novo Modelo" value={hierarchyInputValues.model} onChange={handleHierarchyInputChange}/>
              <button type="button" onClick={() => handleSaveHierarchyItem('model')}>Salvar</button>
            </div>
          )}
        </div>
        <div className="form-group hierarchy-group">
          <label htmlFor="referenceCode">Código de Referência:</label>
          <select id="referenceCode" name="referenceCode" value={newProduct.referenceCode} onChange={handleInputChange} required disabled={!newProduct.model}>
            <option value="">Selecione o Código de Referência</option>
            {availableReferenceCodes.map(refCode => (
              <option key={refCode} value={refCode}>{refCode}</option>
            ))}
          </select>
           <button type="button" className="add-hierarchy-button" onClick={() => handleAddHierarchyItem('referenceCode')} disabled={!newProduct.model}>+</button>
          {showNewInput.referenceCode && (
            <div className="inline-input">
              <input type="text" name="referenceCode" placeholder="Novo Código de Referência" value={hierarchyInputValues.referenceCode} onChange={handleHierarchyInputChange}/>
              <button type="button" onClick={() => handleSaveHierarchyItem('referenceCode')}>Salvar</button>
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="color">Cor:</label>
          <input type="text" id="color" name="color" value={newProduct.color} onChange={handleInputChange} />
        </div>
         <div className="form-group">
          <label htmlFor="largura">Largura (m):</label>
          <input type="number" id="largura" name="largura" value={newProduct.largura} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label htmlFor="price">Preço de Venda:</label>
          <input type="number" id="price" name="price" value={newProduct.price} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label htmlFor="cost">Preço de Custo:</label>
          <input type="number" id="cost" name="cost" value={newProduct.cost} onChange={handleInputChange} />
        </div>

        <div className="form-actions">
          <button type="submit">{editingProductId ? 'Salvar Edição' : 'Adicionar Produto'}</button>
          {editingProductId && <button type="button" onClick={handleCancelEdit}>Cancelar Edição</button>}
        </div>
      </form>

      <h3>Lista de Produtos</h3>
      <ul className="product-list">
        {products.map(product => (
          <li key={product.id} className="product-item">
            Código: {product.referenceCode} <br />
            Categoria: {product.category} <br />
            Material: {product.material} <br />
            Modelo: {product.model} <br />
            Cor: {product.color} <br />
            Largura: {product.largura}m <br />
            Preço Venda: R$ {product.price} <br />
            Preço Custo: R$ {product.cost}
            <div className="product-actions">
              <button onClick={() => handleEditProduct(product.id)}>Editar</button>
              <button onClick={() => handleDeleteProduct(product.id)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Products
