import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import SelectOrCreate from './SelectOrCreate';

function Accessories({ accessories, setAccessories }) {
  const [newAccessory, setNewAccessory] = useState({
    produto: null,
    measurement_mm: null,
    unit: '',
    colors: [],
  });
  const [newColor, setNewColor] = useState({ color: '', price: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [medidas, setMedidas] = useState([]);

  useEffect(() => {
    fetchAccessories();
    fetchProdutos();
    fetchMedidas();
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

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase.from('produtos').select('*');
      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchMedidas = async () => {
    try {
      const { data, error } = await supabase.from('medidas').select('*');
      if (error) throw error;
      setMedidas(data || []);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAccessory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProdutoChange = (selectedProduto) => {
    setNewAccessory((prev) => ({ ...prev, produto: selectedProduto }));
  };

  const handleMedidaChange = (selectedMedida) => {
    setNewAccessory((prev) => ({ ...prev, measurement_mm: selectedMedida }));
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
      !newAccessory.produto ||
      !newAccessory.measurement_mm ||
      !newAccessory.unit.trim() ||
      newAccessory.colors.length === 0
    )
      return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('accessories')
        .insert([
          {
            produto: newAccessory.produto.id,
            measurement_mm: newAccessory.measurement_mm.id,
            unit: newAccessory.unit,
            colors: newAccessory.colors,
          },
        ])
        .select();

      if (insertError) throw insertError;

      setAccessories((prevAccessories) => [...prevAccessories, ...data]);
      setNewAccessory({
        produto: null,
        measurement_mm: null,
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
          <label htmlFor="produto">Produto:</label>
          <SelectOrCreate
            id="produto"
            name="produto"
            options={produtos}
            labelKey="nome"
            valueKey="id"
            onChange={handleProdutoChange}
            onCreate={async (newProdutoName) => {
              try {
                const { data, error } = await supabase
                  .from('produtos')
                  .insert([{ nome: newProdutoName }])
                  .select();
                if (error) throw error;
                setProdutos([...produtos, data[0]]);
                return data[0];
              } catch (error) {
                setError(error.message);
                return null;
              }
            }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="measurement_mm">Medida (MM):</label>
          <SelectOrCreate
            id="measurement_mm"
            name="measurement_mm"
            options={medidas}
            labelKey="medida"
            valueKey="id"
            onChange={handleMedidaChange}
            onCreate={async (newMedidaValue) => {
              try {
                const { data, error } = await supabase
                  .from('medidas')
                  .insert([{ medida: newMedidaValue }])
                  .select();
                if (error) throw error;
                setMedidas([...medidas, data[0]]);
                return data[0];
              } catch (error) {
                setError(error.message);
                return null;
              }
            }}
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
                Produto: {accessory.produto}, Medida: {accessory.measurement_mm},
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
