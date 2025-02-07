import React, { useState } from 'react';

function Accessories({ accessories, setAccessories }) {
  const [newAccessory, setNewAccessory] = useState({ name: '', price: 0 });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      setNewAccessory(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setNewAccessory(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddAccessory = (e) => {
    e.preventDefault();
    if (newAccessory.name.trim() && newAccessory.price >= 0) {
      setAccessories([...accessories, { ...newAccessory, id: Date.now() }]);
      setNewAccessory({ name: '', price: 0 }); // Clear the form
    }
  };

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
        <button type="submit">Adicionar Acessório</button>
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
