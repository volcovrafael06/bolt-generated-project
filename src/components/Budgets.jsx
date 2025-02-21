import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SelectOrCreate from './SelectOrCreate';
import { supabase } from '../supabase/client';
import './Budgets.css';

function Budgets({ budgets, setBudgets, customers: initialCustomers, products: initialProducts, accessories: initialAccessories, setCustomers: updateParentCustomers }) {
  const navigate = useNavigate();
  const { budgetId } = useParams();
  const isEditing = budgetId !== undefined;

  const [newBudget, setNewBudget] = useState({
    customer: null,
    products: [],
    accessories: [],
    observation: '',
    totalValue: 0
  });

  const [currentProduct, setCurrentProduct] = useState({
    product: null,
    width: '',
    height: '',
    bando: false,
    bandoValue: 0,
    installation: false,
    installationValue: 0,
    subtotal: 0
  });

  const [currentAccessory, setCurrentAccessory] = useState({
    accessory: null,
    color: '',
    quantity: 1,
    subtotal: 0
  });

  const [localCustomers, setLocalCustomers] = useState([]);
  const [products, setProducts] = useState(initialProducts || []);
  const [accessoriesList, setAccessoriesList] = useState(initialAccessories || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState({ customer: '', product: '', accessory: '' });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .order('name');

        if (error) throw error;
        setLocalCustomers(data || []);
        updateParentCustomers?.(data || []); // Update parent state if callback exists
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError('Erro ao carregar clientes');
      }
    };

    fetchCustomers();
  }, [updateParentCustomers]);

  useEffect(() => {
    setProducts(initialProducts || []);
  }, [initialProducts]);

  useEffect(() => {
    setAccessoriesList(initialAccessories || []);
  }, [initialAccessories]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!initialCustomers || !initialProducts || !initialAccessories) {
        await Promise.all([
          fetchCustomers(),
          fetchProducts(),
          fetchAccessories()
        ]);
      }
    };

    loadInitialData();
  }, [initialCustomers, initialProducts, initialAccessories]);

  useEffect(() => {
    if (isEditing && budgetId) {
      const loadBudgetData = async () => {
        try {
          console.log('Loading budget for editing:', budgetId);
          
          // Buscar o orçamento diretamente do Supabase
          const { data: budget, error } = await supabase
            .from('orcamentos')
            .select(`
              *,
              clientes (
                id,
                name,
                email,
                phone,
                address
              )
            `)
            .eq('id', budgetId)
            .single();

          if (error) throw error;
          
          console.log('Loaded budget:', budget);
          
          let products = [];
          let accessories = [];

          try {
            products = JSON.parse(budget.produtos_json || '[]');
            accessories = JSON.parse(budget.acessorios_json || '[]');
            
            // Adicionar informações completas dos produtos
            products = products.map(p => {
              const fullProduct = initialProducts?.find(prod => prod.id === p.produto_id) || {};
              return {
                product: fullProduct,
                width: p.largura || '',
                height: p.altura || '',
                bando: p.bando || false,
                bandoValue: p.valor_bando || 0,
                installation: p.instalacao || false,
                installationValue: p.valor_instalacao || 0,
                subtotal: p.subtotal || 0
              };
            });

            // Adicionar informações completas dos acessórios
            accessories = accessories.map(a => {
              const fullAccessory = initialAccessories?.find(acc => acc.id === a.accessory_id) || {};
              return {
                accessory: fullAccessory,
                color: a.color || '',
                quantity: a.quantity || 1,
                subtotal: a.subtotal || 0
              };
            });

          } catch (e) {
            console.error('Error parsing budget data:', e);
          }

          console.log('Processed products:', products);
          console.log('Processed accessories:', accessories);

          setNewBudget({
            customer: budget.clientes,
            products,
            accessories,
            observation: budget.observacao || '',
            totalValue: budget.valor_total || 0
          });
        } catch (error) {
          console.error('Error loading budget:', error);
          setError('Erro ao carregar orçamento');
        }
      };

      loadBudgetData();
    }
  }, [isEditing, budgetId, initialProducts, initialAccessories]);

  useEffect(() => {
    calculateProductSubtotal();
  }, [currentProduct.product, currentProduct.width, currentProduct.height, currentProduct.bando, currentProduct.installation, currentProduct.installationValue]);

  useEffect(() => {
    calculateAccessorySubtotal();
  }, [currentAccessory.accessory, currentAccessory.color, currentAccessory.quantity]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('produtos').select('*');
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
    }
  };

  const fetchAccessories = async () => {
    try {
      const { data, error } = await supabase
        .from('accessories')  // Correct table name from database
        .select('*')
        .order('name');      // Add ordering
      
      if (error) throw error;
      
      if (data) {
        console.log('Fetched accessories:', data);  // Add logging for debugging
        setAccessoriesList(data);
      } else {
        setAccessoriesList([]);
      }
    } catch (error) {
      console.error('Error fetching accessories:', error);
      setError('Erro ao carregar acessórios');
    }
  };

  const calculateProductSubtotal = () => {
    if (!currentProduct.product || !currentProduct.width) return;

    let subtotal = 0;
    const width = parseFloat(currentProduct.width) || 0;
    const height = parseFloat(currentProduct.height) || 0;
    const price = parseFloat(currentProduct.product.preco_venda) || 0;

    // Calculate product value based on model
    if (currentProduct.product.modelo.toUpperCase() === 'WAVE') {
      subtotal = width * price;
    } else if (width && height) {
      subtotal = width * height * price;
    }

    // Add bandô value if selected
    if (currentProduct.bando) {
      const bandoValue = width * 120;
      subtotal += bandoValue;
      setCurrentProduct(prev => ({ ...prev, bandoValue }));
    }

    // Add installation value if selected
    if (currentProduct.installation) {
      subtotal += parseFloat(currentProduct.installationValue) || 0;
    }

    setCurrentProduct(prev => ({ ...prev, subtotal }));
  };

  const calculateAccessorySubtotal = () => {
    if (!currentAccessory.accessory || !currentAccessory.color || !currentAccessory.quantity) return;

    const quantity = parseInt(currentAccessory.quantity, 10) || 1;
    const color = currentAccessory.accessory.colors.find(c => c.color === currentAccessory.color);

    if (!color) {
      setCurrentAccessory(prev => ({ ...prev, subtotal: 0 }));
      return;
    }

    const subtotal = quantity * color.price;
    setCurrentAccessory(prev => ({ ...prev, subtotal }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setCurrentProduct(prev => ({ ...prev, [name]: newValue }));
  };

  const handleAccessoryInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAccessory(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (selectedCustomer) => {
    setNewBudget(prev => ({
      ...prev,
      customer: selectedCustomer
    }));
  };

  const handleCreateCustomer = async (name) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          name,
          email: '',
          phone: '',
          address: '',
          cpf: ''
        }])
        .select()
        .single();

      if (error) throw error;

      setLocalCustomers(prev => [...prev, data]);
      updateParentCustomers?.(prev => [...prev, data]); // Update parent state if callback exists
      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      setError('Erro ao criar cliente');
      return null;
    }
  };

  const handleProductChange = (selectedProduct) => {
    setCurrentProduct(prev => ({
      ...prev,
      product: selectedProduct,
      width: '',
      height: '',
      bando: false,
      bandoValue: 0,
      installation: false,
      installationValue: 0,
      subtotal: 0
    }));
  };

  const handleAccessoryChange = (selectedAccessory) => {
    setCurrentAccessory(prev => ({
      ...prev,
      accessory: selectedAccessory,
      color: '',
      quantity: 1,
      subtotal: 0
    }));
  };

  const handleAddProduct = () => {
    if (!currentProduct.product || !currentProduct.width) {
      setError("Por favor, preencha todos os campos do produto.");
      return;
    }

    // Add the new product
    const updatedProducts = [...newBudget.products, { ...currentProduct }];

    // Calculate new total
    const productsTotal = updatedProducts.reduce((sum, prod) => sum + (prod.subtotal || 0), 0);
    const accessoriesTotal = newBudget.accessories.reduce((sum, acc) => sum + (acc.subtotal || 0), 0);
    const newTotal = productsTotal + accessoriesTotal;

    // Update budget with new product and total
    setNewBudget(prev => ({
      ...prev,
      products: updatedProducts,
      totalValue: newTotal
    }));

    // Reset current product
    setCurrentProduct({
      product: null,
      width: '',
      height: '',
      bando: false,
      bandoValue: 0,
      installation: false,
      installationValue: 0,
      subtotal: 0
    });
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = newBudget.products.filter((_, i) => i !== index);

    const productsTotal = updatedProducts.reduce((sum, prod) => sum + (prod.subtotal || 0), 0);
    const accessoriesTotal = newBudget.accessories.reduce((sum, acc) => sum + (acc.subtotal || 0), 0);
    const newTotal = productsTotal + accessoriesTotal;

    setNewBudget(prev => ({
      ...prev,
      products: updatedProducts,
      totalValue: newTotal
    }));
  };

  const handleEditProduct = (index) => {
    const productToEdit = newBudget.products[index];
    setCurrentProduct(productToEdit);
    
    // Remover o produto da lista
    const updatedProducts = newBudget.products.filter((_, i) => i !== index);
    const productsTotal = updatedProducts.reduce((sum, prod) => sum + (prod.subtotal || 0), 0);
    const accessoriesTotal = newBudget.accessories.reduce((sum, acc) => sum + (acc.subtotal || 0), 0);
    
    setNewBudget(prev => ({
      ...prev,
      products: updatedProducts,
      totalValue: productsTotal + accessoriesTotal
    }));
  };

  const handleAddAccessory = () => {
    if (!currentAccessory.accessory || !currentAccessory.color || !currentAccessory.quantity) {
      setError("Por favor, preencha todos os campos do acessório.");
      return;
    }

    const updatedAccessories = [...newBudget.accessories, { ...currentAccessory }];

    const productsTotal = newBudget.products.reduce((sum, prod) => sum + (prod.subtotal || 0), 0);
    const accessoriesTotal = updatedAccessories.reduce((sum, acc) => sum + (acc.subtotal || 0), 0);
    const newTotal = productsTotal + accessoriesTotal;

    setNewBudget(prev => ({
      ...prev,
      accessories: updatedAccessories,
      totalValue: newTotal
    }));

    setCurrentAccessory({
      accessory: null,
      color: '',
      quantity: 1,
      subtotal: 0
    });
  };

  const handleRemoveAccessory = (index) => {
    const updatedAccessories = newBudget.accessories.filter((_, i) => i !== index);

    const productsTotal = newBudget.products.reduce((sum, prod) => sum + (prod.subtotal || 0), 0);
    const accessoriesTotal = updatedAccessories.reduce((sum, acc) => sum + (acc.subtotal || 0), 0);
    const newTotal = productsTotal + accessoriesTotal;

    setNewBudget(prev => ({
      ...prev,
      accessories: updatedAccessories,
      totalValue: newTotal
    }));
  };

  const handleEditAccessory = (index) => {
    const accessoryToEdit = newBudget.accessories[index];
    setCurrentAccessory(accessoryToEdit);
    
    // Remover o acessório da lista
    const updatedAccessories = newBudget.accessories.filter((_, i) => i !== index);
    const productsTotal = newBudget.products.reduce((sum, prod) => sum + (prod.subtotal || 0), 0);
    const accessoriesTotal = updatedAccessories.reduce((sum, acc) => sum + (acc.subtotal || 0), 0);
    
    setNewBudget(prev => ({
      ...prev,
      accessories: updatedAccessories,
      totalValue: productsTotal + accessoriesTotal
    }));
  };

  const handleFinalizeBudget = async (e) => {
    e.preventDefault();

    if (!newBudget.customer) {
      setError("Por favor, selecione um cliente.");
      return;
    }

    if (newBudget.products.length === 0 && newBudget.accessories.length === 0) {
      setError("Por favor, adicione pelo menos um produto ou acessório.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Clean up the products data to match the database structure
      const cleanProducts = newBudget.products.map(product => ({
        produto_id: product.product.id,
        largura: parseFloat(product.width),
        altura: product.height ? parseFloat(product.height) : null,
        bando: product.bando,
        valor_bando: product.bandoValue,
        instalacao: product.installation,
        valor_instalacao: parseFloat(product.installationValue),
        subtotal: product.subtotal
      }));

      const cleanAccessories = newBudget.accessories.map(accessory => ({
        accessory_id: accessory.accessory.id,
        color: accessory.color,
        quantity: parseInt(accessory.quantity, 10),
        subtotal: accessory.subtotal
      }));

      const budgetData = {
        cliente_id: newBudget.customer.id,
        valor_total: newBudget.totalValue,
        produtos_json: JSON.stringify(cleanProducts),
        observacao: newBudget.observation || '',
        acessorios_json: JSON.stringify(cleanAccessories)
      };

      console.log('Saving budget with data:', budgetData);

      let result;
      if (isEditing) {
        const { data, error } = await supabase
          .from('orcamentos')
          .update(budgetData)
          .eq('id', budgetId)
          .select(`
            *,
            clientes (
              id,
              name,
              email,
              phone,
              address
            )
          `)
          .single();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        result = data;

        setBudgets(prev => prev.map(b =>
          b.id === parseInt(budgetId) ? { ...b, ...result } : b
        ));
      } else {
        const { data, error } = await supabase
          .from('orcamentos')
          .insert([budgetData])
          .select(`
            *,
            clientes (
              id,
              name,
              email,
              phone,
              address
            )
          `)
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        result = data;

        setBudgets(prev => [...prev, result]);
      }

      navigate('/budgets');
    } catch (error) {
      console.error('Detailed error:', error);
      setError(`Erro ao salvar orçamento: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = localCustomers.filter(customer =>
    customer.name.toLowerCase().includes((searchTerm.customer || '').toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.nome?.toLowerCase().includes(searchTerm.product.toLowerCase()) ||
    product.modelo?.toLowerCase().includes(searchTerm.product.toLowerCase()) ||
    product.tecido?.toLowerCase().includes(searchTerm.product.toLowerCase()) ||
    product.codigo?.toLowerCase().includes(searchTerm.product.toLowerCase())
  );

  const filteredAccessories = accessoriesList.filter(accessory =>
    accessory.name?.toLowerCase().includes((searchTerm.accessory || '').toLowerCase()) ||
    accessory.description?.toLowerCase().includes((searchTerm.accessory || '').toLowerCase())
  );

  const productsTotal = newBudget.products.reduce((sum, prod) => sum + (prod.subtotal || 0), 0);
  const accessoriesTotal = newBudget.accessories.reduce((sum, acc) => sum + (acc.subtotal || 0), 0);
  const totalValue = productsTotal + accessoriesTotal;

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="budgets-container">
      <h2>{isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}</h2>
      <form onSubmit={handleFinalizeBudget}>
        {/* Cliente Section */}
        <div className="form-section">
          <h3>Cliente</h3>
          <SelectOrCreate
            options={localCustomers}
            value={newBudget.customer}
            labelKey="name"
            valueKey="id"
            onChange={handleCustomerChange}
            onCreate={handleCreateCustomer}
            id="customer"
            name="customer"
          />
        </div>

        {/* Produtos Section */}
        <div className="form-section">
          <h3>Produtos</h3>

          {/* Lista de produtos já adicionados */}
          {newBudget.products.length > 0 && (
            <div className="added-products">
              <h4>Produtos Adicionados ({newBudget.products.length})</h4>
              <div className="products-summary">
                <p>Total de produtos: {newBudget.products.length}</p>
                <p>Valor total dos produtos: R$ {productsTotal.toFixed(2)}</p>
              </div>
              {newBudget.products.map((prod, index) => (
                <div key={index} className="added-product-item">
                  <div className="product-info">
                    {prod.product && (<p><strong>{prod.product.nome}</strong> - {prod.product.modelo}</p>)}
                    <p>Dimensões: {prod.width}m {prod.height && `x ${prod.height}m`}</p>
                    {prod.bando && <p>Bandô incluído</p>}
                    {prod.installation && <p>Instalação: R$ {prod.installationValue}</p>}
                    <p className="product-subtotal">Subtotal: R$ {prod.subtotal.toFixed(2)}</p>
                  </div>
                  <div className="actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => handleEditProduct(index)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => handleRemoveProduct(index)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Adicionar novo produto */}
          <div className="add-product">
            <h4>Adicionar Produto</h4>
            <input
              type="text"
              placeholder="Pesquisar produto..."
              value={searchTerm.product}
              onChange={(e) => setSearchTerm(prev => ({ ...prev, product: e.target.value }))}
            />
            <SelectOrCreate
              options={filteredProducts}
              value={currentProduct.product}
              onChange={handleProductChange}
              labelKey="nome"
              valueKey="id"
              onCreate={fetchProducts}
              showCreate={false}
            />

            {currentProduct.product && (
              <>
                <div className="product-measurements">
                  <input
                    type="number"
                    name="width"
                    value={currentProduct.width}
                    onChange={handleInputChange}
                    placeholder="Largura"
                    step="0.01"
                  />
                  {currentProduct.product.modelo !== 'WAVE' && (
                    <input
                      type="number"
                      name="height"
                      value={currentProduct.height}
                      onChange={handleInputChange}
                      placeholder="Altura"
                      step="0.01"
                    />
                  )}
                </div>

                <div className="additional-options">
                  <label>
                    <input
                      type="checkbox"
                      name="bando"
                      checked={currentProduct.bando}
                      onChange={handleInputChange}
                    />
                    Bandô
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="installation"
                      checked={currentProduct.installation}
                      onChange={handleInputChange}
                    />
                    Instalação
                  </label>

                  {currentProduct.installation && (
                    <input
                      type="number"
                      name="installationValue"
                      value={currentProduct.installationValue}
                      onChange={handleInputChange}
                      placeholder="Valor da instalação"
                      step="0.01"
                    />
                  )}
                </div>

                {currentProduct.subtotal > 0 && (
                  <p>Subtotal do produto: R$ {currentProduct.subtotal.toFixed(2)}</p>
                )}

                <button
                  type="button"
                  className="add-product-button"
                  onClick={handleAddProduct}
                >
                  Adicionar Produto
                </button>
              </>
            )}
          </div>
        </div>

        {/* Acessórios Section */}
        <div className="form-section">
          <h3>Acessórios</h3>

          {/* Lista de acessórios já adicionados */}
          {newBudget.accessories.length > 0 && (
            <div className="added-accessories">
              <h4>Acessórios Adicionados ({newBudget.accessories.length})</h4>
              <div className="accessories-summary">
                <p>Total de acessórios: {newBudget.accessories.length}</p>
                <p>Valor total dos acessórios: R$ {accessoriesTotal.toFixed(2)}</p>
              </div>
              {newBudget.accessories.map((acc, index) => (
                <div key={index} className="added-accessory-item">
                  <div className="accessory-info">
                    <p><strong>{acc.accessory.name}</strong></p>
                    <p>Cor: {acc.color}</p>
                    <p>Quantidade: {acc.quantity}</p>
                    <p className="accessory-subtotal">Subtotal: R$ {acc.subtotal.toFixed(2)}</p>
                  </div>
                  <div className="actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => handleEditAccessory(index)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => handleRemoveAccessory(index)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Adicionar novo acessório */}
          <div className="add-accessory">
            <h4>Adicionar Acessório</h4>
            <input
              type="text"
              placeholder="Pesquisar acessório..."
              value={searchTerm.accessory}
              onChange={(e) => setSearchTerm(prev => ({ ...prev, accessory: e.target.value }))}
            />
            <SelectOrCreate
              options={filteredAccessories}
              value={currentAccessory.accessory}
              onChange={handleAccessoryChange}
              labelKey="name"
              valueKey="id"
              onCreate={fetchAccessories}
              showCreate={false}
            />

            {currentAccessory.accessory && (
              <>
                <div className="accessory-options">
                  <select
                    name="color"
                    value={currentAccessory.color}
                    onChange={handleAccessoryInputChange}
                  >
                    <option value="" disabled>Selecione a cor</option>
                    {currentAccessory.accessory.colors.map((color, index) => (
                      <option key={index} value={color.color}>
                        {color.color}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    name="quantity"
                    value={currentAccessory.quantity}
                    onChange={handleAccessoryInputChange}
                    placeholder="Quantidade"
                    min="1"
                  />
                </div>

                {currentAccessory.subtotal > 0 && (
                  <p>Subtotal do acessório: R$ {currentAccessory.subtotal.toFixed(2)}</p>
                )}

                <button
                  type="button"
                  className="add-accessory-button"
                  onClick={handleAddAccessory}
                >
                  Adicionar Acessório
                </button>
              </>
            )}
          </div>
        </div>

        {/* Observação Section */}
        <div className="form-section">
          <h3>Observação</h3>
          <textarea
            name="observation"
            value={newBudget.observation}
            onChange={(e) => setNewBudget(prev => ({ ...prev, observation: e.target.value }))}
            rows="4"
          />
        </div>

        {/* Total Value and Submit */}
        {totalValue > 0 && (
          <div className="total-value">
            <h3>Valor Total: R$ {totalValue.toFixed(2)}</h3>
          </div>
        )}

        <button type="submit" className="finalize-button" disabled={loading}>
          {isEditing ? 'Salvar Alterações' : 'Finalizar Orçamento'}
        </button>
      </form>
    </div>
  );
}

export default Budgets;
