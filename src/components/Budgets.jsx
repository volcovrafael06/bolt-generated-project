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
    totalValue: 0,
    negotiatedValue: null
  });

  const [currentProduct, setCurrentProduct] = useState({
    product: null,
    width: '',
    height: '',
    bando: false,
    bandoValue: 0,
    bandoCusto: 0,
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
  const [bandoConfig, setBandoConfig] = useState({
    custo: 80,
    venda: 120
  });

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
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [customersResponse, productsResponse, accessoriesResponse] = await Promise.all([
          !initialCustomers && supabase.from('clientes').select('*').order('name'),
          !initialProducts && supabase.from('produtos').select('*'),
          !initialAccessories && supabase.from('accessories').select('*').order('name')
        ]);

        if (customersResponse && customersResponse.error) throw customersResponse.error;
        if (productsResponse && productsResponse.error) throw productsResponse.error;
        if (accessoriesResponse && accessoriesResponse.error) throw accessoriesResponse.error;

        if (customersResponse) {
          setLocalCustomers(customersResponse.data || []);
          updateParentCustomers?.(customersResponse.data || []);
        }
        
        if (productsResponse) {
          setProducts(productsResponse.data || []);
        }
        
        if (accessoriesResponse) {
          setAccessoriesList(accessoriesResponse.data || []);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Erro ao carregar dados iniciais');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [initialCustomers, initialProducts, initialAccessories, updateParentCustomers]);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const { data, error } = await supabase.from('produtos').select('*');
        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching latest products:', error);
      }
    };

    const productsSubscription = supabase
      .channel('produtos_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'produtos' 
        }, 
        () => {
          fetchLatestProducts();
        }
      )
      .subscribe();

    fetchLatestProducts();

    return () => {
      productsSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadBandoConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('configuracoes')
          .select('bando_custo, bando_venda')
          .single();

        if (error) throw error;

        if (data) {
          setBandoConfig({
            custo: data.bando_custo || 80,
            venda: data.bando_venda || 120
          });
        }
      } catch (error) {
        console.error('Error loading bando config:', error);
      }
    };

    loadBandoConfig();
  }, []);

  useEffect(() => {
    if (isEditing && budgetId) {
      const loadBudgetData = async () => {
        try {
          console.log('Loading budget for editing:', budgetId);
          
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
            
            products = products.map(p => {
              const fullProduct = initialProducts?.find(prod => prod.id === p.produto_id) || {};
              return {
                product: fullProduct,
                width: p.largura || '',
                height: p.altura || '',
                bando: p.bando || false,
                bandoValue: p.valor_bando || 0,
                bandoCusto: p.valor_bando_custo || 0,
                installation: p.instalacao || false,
                installationValue: p.valor_instalacao || 0,
                subtotal: p.subtotal || 0
              };
            });

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
            totalValue: budget.valor_total || 0,
            negotiatedValue: budget.valor_negociado
          });
        } catch (error) {
          console.error('Error loading budget:', error);
          setError('Erro ao carregar orçamento');
        }
      };

      loadBudgetData();
    }
  }, [isEditing, budgetId, initialProducts, initialAccessories]);

  const calculateProductSubtotal = (product = currentProduct) => {
    if (!product.product || !product.width) return 0;

    let subtotal = 0;
    
    const dimensions = calculateDimensions(
      product.product,
      product.width,
      product.height
    );

    const width = dimensions.width;
    const height = dimensions.height;
    const price = parseFloat(product.product.preco_venda) || 0;

    if (product.product.modelo.toUpperCase() === 'WAVE') {
      subtotal = width * price;
    } else if (width && height) {
      subtotal = width * height * price;
    }

    if (product.bando) {
      const dimensions = calculateDimensions(
        product.product,
        product.width,
        product.height
      );
      const bandoValue = dimensions.width * bandoConfig.venda;
      const bandoCusto = dimensions.width * bandoConfig.custo;
      subtotal += bandoValue;
      if (product === currentProduct) {
        setCurrentProduct(prev => ({ 
          ...prev, 
          bandoValue,
          bandoCusto 
        }));
      }
    }

    if (product.installation) {
      subtotal += parseFloat(product.installationValue) || 0;
    }

    if (product === currentProduct) {
      setCurrentProduct(prev => ({ 
        ...prev, 
        subtotal,
        calculatedWidth: dimensions.width,
        calculatedHeight: dimensions.height,
        usedMinimum: dimensions.usedMinimum
      }));
    }

    return subtotal;
  };

  const handleProductDimensionChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => {
      const updates = { ...prev, [name]: value };
      
      if (name === 'width' || name === 'height') {
        if (updates.product) {
          calculateProductSubtotal(updates);
        }
      }
      
      return updates;
    });
  };

  useEffect(() => {
    if (currentProduct.product && (currentProduct.width || currentProduct.height)) {
      calculateProductSubtotal();
    }
  }, [currentProduct.product, currentProduct.width, currentProduct.height, currentProduct.bando, currentProduct.installation, currentProduct.installationValue]);

  const calculateAccessorySubtotal = () => {
    if (!currentAccessory.accessory || !currentAccessory.color || !currentAccessory.quantity) return;

    const quantity = parseInt(currentAccessory.quantity, 10) || 1;
    const color = currentAccessory.accessory.colors.find(c => c.color === currentAccessory.color);

    if (!color) {
      setCurrentAccessory(prev => ({ ...prev, subtotal: 0 }));
      return;
    }

    const subtotal = quantity * (parseFloat(color.sale_price) || 0);
    setCurrentAccessory(prev => ({ ...prev, subtotal }));
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

  const calculateDimensions = (product, width, height) => {
    const inputWidth = parseFloat(width) || 0;
    const inputHeight = parseFloat(height) || 0;
    
    const minWidth = parseFloat(product.largura_minima) || 0;
    const minHeight = parseFloat(product.altura_minima) || 0;
    const minArea = parseFloat(product.area_minima) || 0;
    
    let finalWidth = Math.max(inputWidth, minWidth);
    let finalHeight = Math.max(inputHeight, minHeight);
    
    const area = finalWidth * finalHeight;
    
    if (minArea > 0 && area < minArea) {
      const ratio = Math.sqrt(minArea / area);
      finalWidth *= ratio;
      finalHeight *= ratio;
    }
    
    return {
      width: finalWidth,
      height: finalHeight,
      area: finalWidth * finalHeight,
      usedMinimum: finalWidth > inputWidth || finalHeight > inputHeight || (minArea > 0 && area < minArea)
    };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setCurrentProduct(prev => ({ ...prev, [name]: newValue }));
  };

  const handleAccessoryInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAccessory(prev => {
      const updated = { ...prev, [name]: value };
      
      if (updated.accessory && updated.color && updated.quantity) {
        const quantity = parseInt(updated.quantity, 10) || 1;
        const color = updated.accessory.colors.find(c => c.color === updated.color);
        if (color) {
          updated.subtotal = quantity * (parseFloat(color.sale_price) || 0);
        }
      }
      
      return updated;
    });
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
      bandoCusto: 0,
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

    const updatedProducts = [...newBudget.products, { ...currentProduct }];

    const productsTotal = updatedProducts.reduce((sum, prod) => sum + (prod.subtotal || 0), 0);
    const accessoriesTotal = newBudget.accessories.reduce((sum, acc) => sum + (acc.subtotal || 0), 0);
    const newTotal = productsTotal + accessoriesTotal;

    setNewBudget(prev => ({
      ...prev,
      products: updatedProducts,
      totalValue: newTotal
    }));

    setCurrentProduct({
      product: null,
      width: '',
      height: '',
      bando: false,
      bandoValue: 0,
      bandoCusto: 0,
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

      // Primeiro, vamos obter o próximo número de orçamento
      let nextBudgetNumber = 985;
      const { data: maxBudget } = await supabase
        .from('orcamentos')
        .select('numero_orcamento')
        .order('numero_orcamento', { ascending: false })
        .limit(1);

      if (maxBudget && maxBudget.length > 0 && maxBudget[0].numero_orcamento) {
        nextBudgetNumber = Math.max(985, maxBudget[0].numero_orcamento + 1);
      }

      const cleanProducts = newBudget.products.map(product => ({
        produto_id: product.product.id,
        largura: parseFloat(product.width),
        altura: product.height ? parseFloat(product.height) : null,
        bando: product.bando,
        valor_bando: product.bandoValue,
        valor_bando_custo: product.bandoCusto,
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
        acessorios_json: JSON.stringify(cleanAccessories),
        valor_negociado: newBudget.negotiatedValue,
        status: isEditing ? undefined : 'pending',
        numero_orcamento: isEditing ? undefined : nextBudgetNumber // Adiciona o número do orçamento apenas para novos orçamentos
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
              <div className="products-list">
                {newBudget.products.map((prod, index) => (
                  <div key={index} className="added-product-item">
                    <div className="product-info">
                      <p><strong>{prod.product.nome}</strong></p>
                      <p>
                        Dimensões digitadas: {prod.width}m x {prod.height}m
                      </p>
                      {prod.usedMinimum && (
                        <>
                          <p className="minimum-warning">(usando dimensões mínimas)</p>
                          <p>
                            Dimensões calculadas: {prod.calculatedWidth?.toFixed(2)}m x {prod.calculatedHeight?.toFixed(2)}m
                          </p>
                        </>
                      )}
                      {prod.bando && <p>Bandô: R$ {prod.bandoValue.toFixed(2)}</p>}
                      {prod.installation && <p>Instalação: R$ {prod.installationValue}</p>}
                      <p className="product-subtotal">Subtotal: R$ {prod.subtotal.toFixed(2)}</p>
                    </div>
                    <div className="actions">
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
              onCreate={fetchAccessories}
              showCreate={false}
            />

            {currentProduct.product && (
              <>
                <div className="product-measurements">
                  <input
                    type="number"
                    name="width"
                    value={currentProduct.width}
                    onChange={handleProductDimensionChange}
                    placeholder="Largura"
                    step="0.01"
                  />
                  {currentProduct.product.modelo !== 'WAVE' && (
                    <input
                      type="number"
                      name="height"
                      value={currentProduct.height}
                      onChange={handleProductDimensionChange}
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
                    <p>Preço unitário: R$ {acc.accessory.colors.find(c => c.color === acc.color)?.sale_price.toFixed(2)}</p>
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
                    className="form-control"
                  >
                    <option value="">Selecione uma cor</option>
                    {currentAccessory.accessory.colors.map((color, index) => (
                      <option key={index} value={color.color}>
                        {color.color} - R$ {parseFloat(color.sale_price).toFixed(2)}
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

        {/* Valor Negociado Section */}
        <div className="form-section">
          <h3>Valor Negociado</h3>
          <input
            type="number"
            step="0.01"
            value={newBudget.negotiatedValue || ''}
            onChange={(e) => {
              const value = e.target.value ? parseFloat(e.target.value) : null;
              setNewBudget(prev => ({ ...prev, negotiatedValue: value }));
            }}
            placeholder="Digite o valor negociado (opcional)"
          />
          {newBudget.negotiatedValue && (
            <p className="text-sm text-gray-600 mt-1">
              Desconto: {((1 - newBudget.negotiatedValue / newBudget.totalValue) * 100).toFixed(2)}%
            </p>
          )}
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
