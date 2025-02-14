import React, { useState } from 'react';

function SelectOrCreate({ options, labelKey, valueKey, onChange, onCreate, id, name }) {
  const [selectedValue, setSelectedValue] = useState('');
  const [newOption, setNewOption] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange(options.find(option => option[valueKey] === value) || value);
  };

  const handleCreateToggle = () => {
    setCreatingNew(!creatingNew);
    setSelectedValue('');
    setNewOption('');
  };

  const handleCreate = async () => {
    if (newOption.trim() === '') return;
    const createdOption = await onCreate(newOption);
    if (createdOption) {
      setSelectedValue(createdOption[valueKey]);
      onChange(createdOption);
      setCreatingNew(false);
    }
  };

  return (
    <div>
      {!creatingNew ? (
        <>
          <select id={id} name={name} value={selectedValue} onChange={handleChange}>
            <option value="">Selecione</option>
            {options.map((option) => (
              <option key={option[valueKey]} value={option[valueKey]}>
                {option[labelKey]}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleCreateToggle}>
            Criar Novo
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
          />
          <button type="button" onClick={handleCreate}>
            Criar
          </button>
          <button type="button" onClick={handleCreateToggle}>
            Cancelar
          </button>
        </>
      )}
    </div>
  );
}

export default SelectOrCreate;
