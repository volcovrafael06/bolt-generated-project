import React, { useState } from 'react';
import './Configuracoes.css';

function Configuracoes() {
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [validadeOrcamento, setValidadeOrcamento] = useState(30);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted', {
      razaoSocial,
      nomeFantasia,
      endereco,
      telefone,
      validadeOrcamento,
    });
  };

  return (
    <div className="configuracoes-container">
      <h2>Configurações</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="razaoSocial">Razão Social:</label>
          <input
            type="text"
            id="razaoSocial"
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="nomeFantasia">Nome Fantasia:</label>
          <input
            type="text"
            id="nomeFantasia"
            value={nomeFantasia}
            onChange={(e) => setNomeFantasia(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endereco">Endereço:</label>
          <input
            type="text"
            id="endereco"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefone">Telefone:</label>
          <input
            type="tel"
            id="telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="logo">Anexar Logo da Empresa (Max 200KB):</label>
          <input type="file" id="logo" />
        </div>
        <div className="form-group">
          <label htmlFor="validadeOrcamento">Validade do Orçamento (dias):</label>
          <input
            type="number"
            id="validadeOrcamento"
            value={validadeOrcamento}
            onChange={(e) => setValidadeOrcamento(e.target.value)}
          />
        </div>
        <div className="form-actions">
          <button type="button">Gerenciar Vendedores</button>
          <button type="submit">Salvar Configurações</button>
        </div>
      </form>
    </div>
  );
}

export default Configuracoes;
