import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import './Accessories.css';
import { v4 as uuidv4 } from 'uuid';

function Accessories() {
  const [accessories, setAccessories] = useState([]);
  const [newAccessory, setNewAccessory] = useState({
    name: '',
    unit: '',
    colors: [],
  });
  const [newColor, setNewColor] = useState({ color: '', price: 0 });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAccessory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorInputChange = (e) => {
    const { name, value } = e.target;
    setNewColor(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddColor = () => {
    if (!newColor.color.trim() || newColor.price < 0) {
      setError('Cor inválida ou preço negativo');
      return;
    }

    setNewAccessory(prev => ({
      ...prev,
      colors: [...prev.colors, newColor]
    }));
    setNewColor({ color: '', price: 0 });
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
    <div className="accessories-container">
      <h2>Gerenciar Acessórios</h2>

      <form className="accessories-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome do Acessório:</label>
          <input
            type="text"
            name="name"
            value={newAccessory.name}
            onChange={handleInputChange}
            placeholder="Nome do acessório"
          />
        </div>

        <div className="form-group">
          <label>Unidade:</label>
          <input
            type="text"
            name="unit"
            value={newAccessory.unit}
            onChange={handleInputChange}
            placeholder="Ex: metro, peça, etc."
          />
        </div>

        <div className="colors-section">
          <h3>Cores</h3>
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
            <label>Preço:</label>
            <input
              type="number"
              name="price"
              value={newColor.price}
              onChange={handleColorInputChange}
              step="0.01"
              min="0"
            />
          </div>

          <button type="button" className="button" onClick={handleAddColor}>
            Adicionar Cor
          </button>

          <ul className="color-list">
            {newAccessory.colors.map((color, index) => (
              <li key={index} className="color-item">
                {color.color} - R$ {color.price.toFixed(2)}
                <button
                  type="button"
                  className="button"
                  onClick={() => handleDeleteColor(index)}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
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
        
        {!loading && !error && accessories.map(accessory => (
          <div key={accessory.id} className="accessory-item">
            <h4>{accessory.name}</h4>
            <p>Unidade: {accessory.unit}</p>
            <div>
              <strong>Cores:</strong>
              <ul>
                {accessory.colors && accessory.colors.map((color, index) => (
                  <li key={index}>
                    {color.color} - R$ {color.price.toFixed(2)}
                  </li>
                ))}
                {(!accessory.colors || accessory.colors.length === 0) && (
                  <li>Nenhuma cor cadastrada</li>
                )}
              </ul>
            </div>
            <button
              className="button delete-button"
              onClick={() => handleDeleteAccessory(accessory.id)}
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Accessories;
