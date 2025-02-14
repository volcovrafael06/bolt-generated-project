import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

function Accessories({ accessories, setAccessories }) {
  const [newAccessory, setNewAccessory] = useState({
    product_type: 'cadastral',
    measurement_mm: 0,
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
    setError(null);
    try {
      let { data: accessoriesData, error: fetchError } = await supabase
        .from('accessories')
        .select('*');

      if (fetchError) throw fetchError;
      setAccessories(accessoriesData || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAccessory((prev) => ({
      ...prev,
      [name]: name === 'measurement_mm' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleColorInputChange = (e) => {
    const { name, value } = e.target;
    setNewColor((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAddColor = () => {
    if (!newColor.color.trim() || newColor.price < 0) return;
    setNewAccessory((prev) => ({
      ...prev,
      colors: [...prev.colors, newColor],
    }));
    setNewColor({ color: '', price: 0 }); // Clear color input
  };

  const handleAddAccessory = async (e) => {
    e.preventDefault();
    if (
      !newAccessory.product_type ||
      newAccessory.measurement_mm < 0 ||
      !newAccessory.unit.trim() ||
      newAccessory.colors.length === 0
    )
      return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('accessories')
        .insert([newAccessory])
        .select();

      if (insertError) throw insertError;

      setAccessories((prevAccessories) => [...prevAccessories, ...data]);
      setNewAccessory({
        product_type: 'cadastral',
        measurement_mm: 0,
        unit: '',
        colors: [],
      }); // Clear form
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColor = (indexToDelete) => {
    setNewAccessory((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, index) => index !== indexToDelete),
    }));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Acessórios</h2>
      <form onSubmit={handleAddAccessory}>
        <div className="form-group">
          <label htmlFor="product_type">Tipo de Produto:</label>
          <select
            id="product_type"
            name="product_type"
            value={newAccessory.product_type}
            onChange={handleInputChange}
          >
            <option value="cadastral">Cadastral</option>
            <option value="selectable">Selecionável</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="measurement_mm">Medida (MM):</label>
          <input
            type="number"
            id="measurement_mm"
            name="measurement_mm"
            value={newAccessory.measurement_mm}
            onChange={handleInputChange}
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
          />
        </div>

        <div>
          <h3>Cores:</h3>
          <div className="form-group">
            <label htmlFor="color">Cor:</label>
            <input
              type="text"
              id="color"
              name="color"
              value={newColor.color}
              onChange={handleColorInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Preço:</label>
            <input
              type="number"
              id="price"
              name="price"
              value={newColor.price}
              onChange={handleColorInputChange}
            />
          </div>
          <button type="button" onClick={handleAddColor}>
            Adicionar Cor
          </button>
          <ul>
            {newAccessory.colors.map((color, index) => (
              <li key={index}>
                {color.color} - R$ {color.price.toFixed(2)}
                <button type="button" onClick={() => handleDeleteColor(index)}>
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Adicionando...' : 'Adicionar Acessório'}
        </button>
      </form>

      <ul>
        {accessories.map((accessory) => {
          try {
            return (
              <li key={accessory.id}>
                Tipo: {accessory.product_type}, Medida: {accessory.measurement_mm},
                Unidade: {accessory.unit}, Cores:{' '}
                {accessory.colors && accessory.colors.map((color) => (
                  <span key={color.color}>
                    {color.color} (R$ {color.price && color.price.toFixed(2)}){' '}
                  </span>
                ))}
              </li>
            );
          } catch (e) {
            console.error("Error rendering accessory:", accessory, e);
            return null;
          }
        })}
      </ul>
    </div>
  );
}

export default Accessories;
