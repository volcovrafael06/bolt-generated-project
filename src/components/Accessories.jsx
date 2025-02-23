import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import './Accessories.css';
import { v4 as uuidv4 } from 'uuid';

function Accessories() {
  const [accessories, setAccessories] = useState([]);
  const [newAccessory, setNewAccessory] = useState({
    name: '',
    unit: '',
    colors: []
  });
  const [newColor, setNewColor] = useState({
    color: '',
    cost_price: 0,
    profit_margin: 0,
    sale_price: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('accessories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      console.log('Fetched accessories:', data);
      setAccessories(data || []);
    } catch (error) {
      console.error('Error fetching accessories:', error);
      setError('Erro ao carregar acessórios: ' + error.message);
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
    setNewAccessory(prev => ({ ...prev, [name]: value }));
  };

  const handleColorInputChange = (e) => {
    const { name, value } = e.target;
    setNewColor(prev => {
      const updates = { ...prev, [name]: value };

      // Atualizar preço de venda quando preço de custo ou margem mudar
      if (name === 'cost_price' || name === 'profit_margin') {
        updates.sale_price = calculateSalePrice(
          name === 'cost_price' ? value : prev.cost_price,
          name === 'profit_margin' ? value : prev.profit_margin
        );
      }

      return updates;
    });
  };

  const handleAddColor = () => {
    if (!newColor.color.trim() || newColor.cost_price < 0) {
      setError('Cor inválida ou preço de custo negativo');
      return;
    }

    setNewAccessory(prev => ({
      ...prev,
      colors: [...prev.colors, { ...newColor }]
    }));

    setNewColor({
      color: '',
      cost_price: 0,
      profit_margin: 0,
      sale_price: 0
    });
    setError(null);
  };

  const handleDeleteColor = (indexToDelete) => {
    setNewAccessory(prev => ({
      ...prev,
      colors: prev.colors.filter((_, index) => index !== indexToDelete)
    }));
  };

  const validateAccessory = () => {
    if (!newAccessory.name.trim()) return 'Digite o nome do acessório';
    if (!newAccessory.unit.trim()) return 'Digite uma unidade';
    if (newAccessory.colors.length === 0) return 'Adicione pelo menos uma cor';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateAccessory();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare the data exactly as the table expects it
      const accessoryData = {
        name: newAccessory.name,
        unit: newAccessory.unit,
        colors: newAccessory.colors
      };

      console.log('Inserting accessory:', accessoryData);

      const { data, error: insertError } = await supabase
        .from('accessories')
        .insert([accessoryData])
        .select();

      if (insertError) throw insertError;

      console.log('Successfully added accessory:', data);
      
      // Reset form
      setNewAccessory({
        name: '',
        unit: '',
        colors: []
      });
      
      // Refresh the list
      fetchAccessories();
      
    } catch (error) {
      console.error('Error adding accessory:', error);
      setError('Erro ao adicionar acessório: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccessory = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este acessório?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('accessories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAccessories(prev => prev.filter(acc => acc.id !== id));
    } catch (error) {
      setError('Erro ao excluir acessório: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="accessories-page">
      <div className="page-header">
        <h1 className="page-title">Gerenciar Acessórios</h1>
      </div>
      <form onSubmit={handleSubmit} className="accessories-form">
        <div className="form-group">
          <label htmlFor="accessoryName">Nome do Acessório:</label>
          <input
            type="text"
            id="accessoryName"
            name="name"
            value={newAccessory.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="unit">Unidade:</label>
          <input
            type="text"
            id="unit"
            name="unit"
            value={newAccessory.unit}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="colors-section">
          <h3>Cores e Preços</h3>
          <div className="color-form">
            <div className="form-group">
              <label>Cor:</label>
              <input
                type="text"
                name="color"
                value={newColor.color}
                onChange={handleColorInputChange}
                placeholder="Nome da cor"
              />
            </div>

            <div className="form-group">
              <label>Preço de Custo:</label>
              <input
                type="number"
                step="0.01"
                name="cost_price"
                value={newColor.cost_price}
                onChange={handleColorInputChange}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Margem de Lucro (%):</label>
              <input
                type="number"
                step="0.01"
                name="profit_margin"
                value={newColor.profit_margin}
                onChange={handleColorInputChange}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Preço de Venda:</label>
              <input
                type="number"
                step="0.01"
                name="sale_price"
                value={newColor.sale_price}
                readOnly
                placeholder="0.00"
              />
            </div>

            <button type="button" onClick={handleAddColor}>
              Adicionar Cor
            </button>
          </div>

          <div className="added-colors">
            <h4>Cores Adicionadas:</h4>
            <table className="colors-table">
              <thead>
                <tr>
                  <th>Cor</th>
                  <th>Preço Custo</th>
                  <th>Margem</th>
                  <th>Preço Venda</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {newAccessory.colors.map((color, index) => (
                  <tr key={index}>
                    <td>{color.color}</td>
                    <td>R$ {parseFloat(color.cost_price).toFixed(2)}</td>
                    <td>{parseFloat(color.profit_margin).toFixed(2)}%</td>
                    <td>R$ {parseFloat(color.sale_price).toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteColor(index)}
                        className="delete-button"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Acessório'}
        </button>
      </form>

      <div className="accessories-list">
        <h3>Acessórios Cadastrados</h3>
        
        {loading && <p>Carregando acessórios...</p>}
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchAccessories} className="retry-button">
              Tentar Novamente
            </button>
          </div>
        )}
        
        {!loading && !error && accessories.length === 0 && (
          <p>Nenhum acessório cadastrado ainda.</p>
        )}
        
        {!loading && !error && (
          <table className="accessories-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Unidade</th>
                <th>Cores e Preços</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {accessories.map((accessory) => (
                <tr key={accessory.id}>
                  <td>{accessory.name}</td>
                  <td>{accessory.unit}</td>
                  <td>
                    <table className="nested-colors-table">
                      <thead>
                        <tr>
                          <th>Cor</th>
                          <th>Custo</th>
                          <th>Margem</th>
                          <th>Venda</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accessory.colors?.map((color, index) => (
                          <tr key={index}>
                            <td>{color.color}</td>
                            <td>R$ {parseFloat(color.cost_price).toFixed(2)}</td>
                            <td>{parseFloat(color.profit_margin).toFixed(2)}%</td>
                            <td>R$ {parseFloat(color.sale_price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                  <td>
                    <button onClick={() => handleDeleteAccessory(accessory.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Accessories;
