import React, { useState, useEffect } from 'react';
    import { supabase } from '../supabase/client';

    function Accessories({ accessories, setAccessories }) {
      const [newAccessory, setNewAccessory] = useState({ name: '', price: 0 });
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
        setNewAccessory(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
      };

      const handleAddAccessory = async (e) => {
        e.preventDefault();
        if (!newAccessory.name.trim() || newAccessory.price < 0) return;

        setLoading(true);
        setError(null);
        try {
          const { data, error: insertError } = await supabase
            .from('accessories')
            .insert([newAccessory])
            .select();

          if (insertError) throw insertError;

          setAccessories(prevAccessories => [...prevAccessories, ...data]);
          setNewAccessory({ name: '', price: 0 }); // Clear form
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error: {error}</p>;

      return (
        <div>
          <h2>Acessórios</h2>
          <form onSubmit={handleAddAccessory}>
            <div className="form-group">
              <label htmlFor="accessory-name">Nome:</label>
              <input
                type="text"
                id="accessory-name"
                name="name"
                value={newAccessory.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="accessory-price">Preço:</label>
              <input
                type="number"
                id="accessory-price"
                name="price"
                value={newAccessory.price}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Adicionando...' : 'Adicionar Acessório'}
            </button>
          </form>

          <ul>
            {accessories.map(accessory => (
              <li key={accessory.id}>
                {accessory.name} - R$ {accessory.price.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    export default Accessories;
