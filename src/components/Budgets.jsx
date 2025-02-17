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

  const [localCustomers, setLocalCustomers] = useState([]);
  const [products, setProducts] = useState(initialProducts || []);
  const [accessoriesList, setAccessoriesList] = useState(initialAccessories || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState({ customer: '', product: '' });

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
    if (!initialCustomers || !initialProducts || !initialAccessories) {
      fetchCustomers();
      fetchProducts();
      fetchAccessories();
    }
    
    // If editing, load the budget data
    if (isEditing && budgetId && budgets) {
      const budget = budgets.find(b => b.id === parseInt(budgetId));
      if (budget) {
        const customer = localCustomers.find(c => c.id === budget.cliente_id);
        let products = [];
        let accessories = [];
        
        try {
          products = JSON.parse(budget.produtos_json || '[]');
          accessories = JSON.parse(budget.acessorios_json || '[]');
        } catch (e) {
          console.error('Error parsing budget data:', e);
        }
        
        setNewBudget({
          customer,
          products,
          accessories,
          observation: budget.observacao || '',
          totalValue: budget.valor_total || 0
        });
      }
    }
  }, [isEditing, budgetId, budgets, localCustomers, products, initialCustomers, initialProducts, initialAccessories]);

  useEffect(() => {
    calculateProductSubtotal();
  }, [currentProduct.product, currentProduct.width, currentProduct.height, currentProduct.bando, currentProduct.installation, currentProduct.installationValue]);

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const { data, error } = await supabase
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
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBudgets(data || []);
      } catch (error) {
        console.error('Error loading budgets:', error);
        setError('Erro ao carregar orçamentos');
      }
    };

    loadBudgets();
  }, [setBudgets]);

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
      const { data, error } = await supabase.from('accessories').select('*');
      if (error) throw error;
      setAccessoriesList(data || []);
    } catch (error) {
      console.error('Error fetching accessories:', error);
      setError(error.message);
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setCurrentProduct(prev => ({ ...prev, [name]: newValue }));
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

  const handleAddProduct = () => {
    if (!currentProduct.product || !currentProduct.width) {
      setError("Por favor, preencha todos os campos do produto.");
      return;
    }

    // Add the new product
    const updatedProducts = [...newBudget.products, { ...currentProduct }];
    
    // Calculate new total
    const newTotal = updatedProducts.reduce((sum, prod) => sum + (prod.subtotal || 0), 0);

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
    const newTotal = updatedProducts.reduce((sum, prod) => sum + (prod.subtotal || 0), 0);
    
    setNewBudget(prev => ({
      ...prev,
      products: updatedProducts,
      totalValue: newTotal
    }));
  };

  const handleFinalizeBudget = async (e) => {
    e.preventDefault();
    
    if (!newBudget.customer) {
      setError("Por favor, selecione um cliente.");
      return;
    }

    if (newBudget.products.length === 0) {
      setError("Por favor, adicione pelo menos um produto.");
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

      const budgetData = {
        cliente_id: newBudget.customer.id,
        valor_total: newBudget.totalValue,
        produtos_json: JSON.stringify(cleanProducts),
        observacao: newBudget.observation || '',
        acessorios_json: JSON.stringify(newBudget.accessories || [])
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
                <p>Valor total dos produtos: R$ {newBudget.totalValue.toFixed(2)}</p>
              </div>
              {newBudget.products.map((prod, index) => (
                <div key={index} className="added-product-item">
                  <div className="product-info">
                    <p><strong>{prod.product.nome}</strong> - {prod.product.modelo}</p>
                    <p>Dimensões: {prod.width}m {prod.height && `x ${prod.height}m`}</p>
                    {prod.bando && <p>Bandô incluído</p>}
                    {prod.installation && <p>Instalação: R$ {prod.installationValue}</p>}
                    <p className="product-subtotal">Subtotal: R$ {prod.subtotal.toFixed(2)}</p>
                  </div>
                  <button 
                    type="button" 
                    className="remove-button"
                    onClick={() => handleRemoveProduct(index)}
                  >
                    Remover
                  </button>
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
        {newBudget.totalValue > 0 && (
          <div className="total-value">
            <h3>Valor Total: R$ {newBudget.totalValue.toFixed(2)}</h3>
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
