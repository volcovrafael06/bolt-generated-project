import React, { useState } from 'react';

function Products({ products, setProducts }) {
  const [productOptions, setProductOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [codeOptions, setCodeOptions] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);

  const [newProduct, setNewProduct] = useState({
    product: '',
    model: '',
    material: '',
    name: '',
    code: '',
    costPrice: 0,
    salePrice: 0,
    profitMargin: 0, // Added profitMargin field
    calculationMethod: 'm2',
    length: 0,
  });

  const [editingProductId, setEditingProductId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const uppercaseFields = ['product', 'model', 'material', 'name', 'code'];
    if (['costPrice', 'salePrice', 'length', 'profitMargin'].includes(name)) { // Include profitMargin
      setNewProduct(prevState => ({
        ...prevState,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setNewProduct(prevState => ({
        ...prevState,
        [name]: uppercaseFields.includes(name) ? value.toUpperCase() : value
      }));
    }
  };

  const handleAddOption = (optionType) => {
    let newOption = prompt(`Digite novo ${optionType}:`);
    if (newOption) {
      newOption = newOption.trim().toUpperCase(); // Convert new option to uppercase
      switch (optionType) {
        case 'product':
          setProductOptions([...productOptions, { label: newOption, value: newOption }]);
          setNewProduct({ ...newProduct, product: newOption });
          break;
        case 'model':
          setModelOptions([...modelOptions, { label: newOption, value: newOption }]);
          setNewProduct({ ...newProduct, model: newOption });
          break;
        case 'material':
          setMaterialOptions([...materialOptions, { label: newOption, value: newOption }]);
          setNewProduct({ ...newProduct, material: newOption });
          break;
        case 'code':
          setCodeOptions([...codeOptions, { label: newOption, value: newOption }]);
          setNewProduct({ ...newProduct, code: newOption });
          break;
        case 'name':
          setNameOptions([...nameOptions, { label: newOption, value: newOption }]);
          setNewProduct({ ...newProduct, name: newOption });
          break;
        default:
          break;
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Calculate salePrice based on costPrice and profitMargin
    const calculatedSalePrice = newProduct.costPrice + (newProduct.costPrice * (newProduct.profitMargin / 100));

    let updatedProducts;
    if (editingProductId !== null) {
      updatedProducts = products.map(product =>
        product.id === editingProductId ? { ...product, ...newProduct, salePrice: calculatedSalePrice } : product // Update salePrice here
      );
      setEditingProductId(null);
    } else {
      updatedProducts = [...products, { ...newProduct, id: Date.now(), salePrice: calculatedSalePrice }]; // Update salePrice here
    }
    setProducts(updatedProducts);
    setNewProduct({
      product: '',
      model: '',
      material: '',
      name: '',
      code: '',
      costPrice: 0,
      salePrice: 0,
      profitMargin: 0, // Reset profitMargin
      calculationMethod: 'm2',
      length: 0,
    });
  };

  const handleEditProduct = (id) => {
    const productToEdit = products.find(product => product.id === id);
    setNewProduct(productToEdit);
    setEditingProductId(id);
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setNewProduct({
      product: '',
      model: '',
      material: '',
      name: '',
      code: '',
      costPrice: 0,
      salePrice: 0,
      profitMargin: 0, // Reset profitMargin
      calculationMethod: 'm2',
      length: 0,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Produto:</label>
          <select value={newProduct.product} name="product" onChange={handleInputChange}>
            <option value="">Selecione um Produto</option>
            {productOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button type="button" onClick={() => handleAddOption('product')}>Adicionar Produto</button>
        </div>
        <div className="form-group">
          <label>Modelo:</label>
          <select value={newProduct.model} name="model" onChange={handleInputChange}>
            <option value="">Selecione um Modelo</option>
            {modelOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button type="button" onClick={() => handleAddOption('model')}>Adicionar Modelo</button>
        </div>
        <div className="form-group">
          <label>Tecido:</label>
          <select value={newProduct.material} name="material" onChange={handleInputChange}>
            <option value="">Selecione um Tecido</option>
            {materialOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button type="button" onClick={() => handleAddOption('material')}>Adicionar Tecido</button>
        </div>
        <div className="form-group">
          <label>Nome:</label>
          <select value={newProduct.name} name="name" onChange={handleInputChange}>
            <option value="">Selecione um Nome</option>
            {nameOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button type="button" onClick={() => handleAddOption('name')}>Adicionar Nome</button>
        </div>
        <div className="form-group">
          <label>Código:</label>
          <select value={newProduct.code} name="code" onChange={handleInputChange}>
            <option value="">Selecione um Código</option>
            {codeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button type="button" onClick={() => handleAddOption('code')}>Adicionar Código</button>
        </div>
        <div className="form-group">
          <label>Preço de Custo:</label>
          <input type="number" name="costPrice" value={newProduct.costPrice} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label>Margem de Lucro (%):</label> {/* Added Margem de Lucro field */}
          <input type="number" name="profitMargin" value={newProduct.profitMargin} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label>Preço de Venda:</label>
          <input type="number" name="salePrice" value={newProduct.salePrice} readOnly /> {/* Sale price is now read-only and calculated */}
        </div>
        <div className="form-group">
          <label>Forma de Cálculo:</label>
          <select value={newProduct.calculationMethod} name="calculationMethod" onChange={handleInputChange}>
            <option value="m2">m2</option>
            <option value="Comprimento">Comprimento</option>
          </select>
        </div>
        {newProduct.calculationMethod === 'Comprimento' && (
          <div className="form-group">
            <label>Medida em Metros:</label>
            <input type="number" name="length" value={newProduct.length} onChange={handleInputChange} />
          </div>
        )}
        <div className="form-actions">
          <button type="submit">{editingProductId !== null ? 'Atualizar Produto' : 'Adicionar Produto'}</button>
          {editingProductId !== null && <button type="button" onClick={handleCancelEdit}>Cancelar</button>}
        </div>
      </form>
      <ul className="product-list">
        {products.map(product => (
          <li key={product.id} className="product-item">
            {product.product} - {product.model} - {product.material} - {product.name} - {product.code} - Custo: {product.costPrice} - Margem: {product.profitMargin}% - Venda: {product.salePrice} - {product.calculationMethod} - {product.length}
            <div className="product-actions">
              <button type="button" onClick={() => handleEditProduct(product.id)}>Editar</button>
              <button type="button" onClick={() => handleDeleteProduct(product.id)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Products;
