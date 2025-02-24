import React, { useState, useEffect } from 'react';
import { produtoService } from '../services/produtoService';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [newProduct, setNewProduct] = useState({
    product: '',
    model: '',
    material: '',
    name: '',
    code: '',
    cost_price: 0,
    profit_margin: 0,
    sale_price: 0,
    calculation_method: 'm2',
    altura_minima: '',
    largura_minima: '',
    area_minima: ''
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.product?.toLowerCase().includes(searchLower) ||
      product.model?.toLowerCase().includes(searchLower) ||
      product.material?.toLowerCase().includes(searchLower) ||
      product.name?.toLowerCase().includes(searchLower) ||
      product.code?.toLowerCase().includes(searchLower) ||
      product.calculation_method?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadOptions();
  }, [products]);

  const loadOptions = () => {
    const loadedProductOptions = new Set(JSON.parse(localStorage.getItem('productOptions')) || []);
    const loadedModelOptions = new Set(JSON.parse(localStorage.getItem('modelOptions')) || []);
    const loadedMaterialOptions = new Set(JSON.parse(localStorage.getItem('materialOptions')) || []);

    // Add options from existing products
    products.forEach(product => {
      if (product.product) loadedProductOptions.add(product.product);
      if (product.model) loadedModelOptions.add(product.model);
      if (product.material) loadedMaterialOptions.add(product.material);
    });

    setProductOptions([...loadedProductOptions].sort());
    setModelOptions([...loadedModelOptions].sort());
    setMaterialOptions([...loadedMaterialOptions].sort());
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await produtoService.getAll();
      const formattedData = data.map(item => ({
        id: item.id,
        product: item.produto,
        model: item.modelo,
        material: item.tecido,
        name: item.nome,
        code: item.codigo,
        cost_price: item.preco_custo,
        profit_margin: item.margem_lucro,
        sale_price: item.preco_venda,
        calculation_method: item.metodo_calculo,
        altura_minima: item.altura_minima || '',
        largura_minima: item.largura_minima || '',
        area_minima: item.area_minima || ''
      }));
      setProducts(formattedData);
    } catch (err) {
      setError('Erro ao carregar produtos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateSalePrice = (costPrice, profitMargin) => {
    const cost = parseFloat(costPrice) || 0;
    const margin = parseFloat(profitMargin) || 0;
    return cost + (cost * (margin / 100));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewProduct(prev => {
      const updates = { ...prev, [name]: value };

      if (name === 'cost_price' || name === 'profit_margin') {
        updates.sale_price = calculateSalePrice(
          name === 'cost_price' ? value : prev.cost_price,
          name === 'profit_margin' ? value : prev.profit_margin
        );
      }

      return updates;
    });
  };

  const handleAddOption = (optionType) => {
    const newOption = prompt(`Digite novo ${optionType}:`);
    if (!newOption) return;

    const formattedOption = newOption.trim().toUpperCase();

    switch (optionType) {
      case 'produto':
        setProductOptions(prev => {
          const updated = [...prev, formattedOption];
          localStorage.setItem('productOptions', JSON.stringify(updated));
          return updated;
        });
        setNewProduct(prev => ({ ...prev, product: formattedOption }));
        break;
      case 'modelo':
        setModelOptions(prev => {
          const updated = [...prev, formattedOption];
          localStorage.setItem('modelOptions', JSON.stringify(updated));
          return updated;
        });
        setNewProduct(prev => ({ ...prev, model: formattedOption }));
        break;
      case 'tecido':
        setMaterialOptions(prev => {
          const updated = [...prev, formattedOption];
          localStorage.setItem('materialOptions', JSON.stringify(updated));
          return updated;
        });
        setNewProduct(prev => ({ ...prev, material: formattedOption }));
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        sale_price: calculateSalePrice(newProduct.cost_price, newProduct.profit_margin)
      };

      if (editingProductId) {
        await produtoService.update(editingProductId, productData);
      } else {
        await produtoService.create(productData);
      }

      loadProducts();
      setNewProduct({
        product: '',
        model: '',
        material: '',
        name: '',
        code: '',
        cost_price: 0,
        profit_margin: 0,
        sale_price: 0,
        calculation_method: 'm2',
        altura_minima: '',
        largura_minima: '',
        area_minima: ''
      });
      setEditingProductId(null);
      setShowModal(false);
    } catch (err) {
      setError('Erro ao salvar produto: ' + err.message);
    }
  };

  const handleEditProduct = (product) => {
    setNewProduct(product);
    setEditingProductId(product.id);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Confirma a exclusão deste produto?')) {
      try {
        await produtoService.delete(id);
        loadProducts();
      } catch (error) {
        setError('Erro ao excluir produto: ' + error.message);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProductId(null);
    setNewProduct({
      product: '',
      model: '',
      material: '',
      name: '',
      code: '',
      cost_price: 0,
      profit_margin: 0,
      sale_price: 0,
      calculation_method: 'm2',
      altura_minima: '',
      largura_minima: '',
      area_minima: ''
    });
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="products-container">
      <div className="products-header">
        <h2>Produtos Cadastrados</h2>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="add-product-button" onClick={() => setShowModal(true)}>
            + Novo Produto
          </button>
        </div>
      </div>

      <div className="products-list">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Modelo</th>
              <th>Tecido</th>
              <th>Nome</th>
              <th>Código</th>
              <th>Preço Custo</th>
              <th>Margem</th>
              <th>Preço Venda</th>
              <th>Cálculo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td>{product.product}</td>
                <td>{product.model}</td>
                <td>{product.material}</td>
                <td>{product.name}</td>
                <td>{product.code}</td>
                <td>R$ {parseFloat(product.cost_price).toFixed(2)}</td>
                <td>{product.profit_margin}%</td>
                <td>R$ {parseFloat(product.sale_price).toFixed(2)}</td>
                <td>{product.calculation_method}</td>
                <td>
                  <button 
                    type="button"
                    onClick={() => handleEditProduct(product)} 
                    className="edit-button"
                  >
                    Editar
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDeleteProduct(product.id)} 
                    className="delete-button"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProductId ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button className="close-button" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Produto:</label>
                  <div className="input-with-button">
                    <select
                      name="product"
                      value={newProduct.product}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione um produto</option>
                      {productOptions.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handleAddOption('produto')}>
                      + Novo
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Modelo:</label>
                  <div className="input-with-button">
                    <select
                      name="model"
                      value={newProduct.model}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione um modelo</option>
                      {modelOptions.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handleAddOption('modelo')}>
                      + Novo
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tecido:</label>
                  <div className="input-with-button">
                    <select
                      name="material"
                      value={newProduct.material}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione um tecido</option>
                      {materialOptions.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handleAddOption('tecido')}>
                      + Novo
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Nome:</label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Código:</label>
                  <input
                    type="text"
                    name="code"
                    value={newProduct.code}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Preço de Custo:</label>
                  <input
                    type="number"
                    name="cost_price"
                    value={newProduct.cost_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Margem de Lucro (%):</label>
                  <input
                    type="number"
                    name="profit_margin"
                    value={newProduct.profit_margin}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Preço de Venda:</label>
                  <input
                    type="number"
                    value={newProduct.sale_price}
                    readOnly
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Método de Cálculo:</label>
                  <select
                    name="calculation_method"
                    value={newProduct.calculation_method}
                    onChange={handleInputChange}
                  >
                    <option value="m2">Metro Quadrado (m²)</option>
                    <option value="linear">Metro Linear</option>
                    <option value="unidade">Unidade</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Altura Mínima (m):</label>
                  <input
                    type="number"
                    step="0.01"
                    name="altura_minima"
                    value={newProduct.altura_minima}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Largura Mínima (m):</label>
                  <input
                    type="number"
                    step="0.01"
                    name="largura_minima"
                    value={newProduct.largura_minima}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Área Mínima (m²):</label>
                  <input
                    type="number"
                    step="0.01"
                    name="area_minima"
                    value={newProduct.area_minima}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingProductId ? 'Atualizar Produto' : 'Cadastrar Produto'}
                </button>
                <button type="button" className="cancel-button" onClick={handleCloseModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
