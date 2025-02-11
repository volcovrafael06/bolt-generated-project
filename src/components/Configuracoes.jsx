import React, { useState, useEffect } from 'react';
    import './Configuracoes.css';

    function Configuracoes() {
      const [cnpj, setCnpj] = useState('');
      const [razaoSocial, setRazaoSocial] = useState('');
      const [nomeFantasia, setNomeFantasia] = useState('');
      const [endereco, setEndereco] = useState('');
      const [telefone, setTelefone] = useState('');
      const [validadeOrcamento, setValidadeOrcamento] = useState(30);
      const [showManageSellers, setShowManageSellers] = useState(false);
      const [sellers, setSellers] = useState(() => {
        const storedSellers = localStorage.getItem('sellers');
        return storedSellers ? JSON.parse(storedSellers) : [];
      });
      const [newSellerName, setNewSellerName] = useState('');
      const [newSellerEmail, setNewSellerEmail] = useState('');
      const [saveMessage, setSaveMessage] = useState('');
      const [cnpjErrorMessage, setCnpjErrorMessage] = useState('');

      useEffect(() => {
        localStorage.setItem('sellers', JSON.stringify(sellers));
      }, [sellers]);

      useEffect(() => {
        const storedConfig = localStorage.getItem('configuracoes');
        if (storedConfig) {
          const config = JSON.parse(storedConfig);
          setCnpj(config.cnpj || '');
          setRazaoSocial(config.razaoSocial || '');
          setNomeFantasia(config.nomeFantasia || '');
          setEndereco(config.endereco || '');
          setTelefone(config.telefone || '');
          setValidadeOrcamento(config.validadeOrcamento || 30);
        }
      }, []);

      const handleCNPJChange = async (e) => {
        const value = e.target.value;
        setCnpj(value);

        // CNPJ validation regex
        const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
        if (value.length > 0 && !cnpjRegex.test(value) && value.length !== 14) {
          setCnpjErrorMessage('CNPJ inválido');
          return;
        } else {
          setCnpjErrorMessage('');
        }

        if (value.length === 14) {
          try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${value}`);
            if (response.ok) {
              const data = await response.json();
              setRazaoSocial(data.razao_social);
              setNomeFantasia(data.nome_fantasia);
              const address = `${data.estabelecimento.logradouro}, ${data.estabelecimento.numero}, ${data.estabelecimento.bairro}, ${data.estabelecimento.municipio} - ${data.estabelecimento.uf}, ${data.estabelecimento.cep}`;
              setEndereco(address);
            } else {
              setRazaoSocial('');
              setNomeFantasia('');
              setEndereco('');
              setCnpjErrorMessage('CNPJ não encontrado');
            }
          } catch (error) {
            console.error('Erro ao buscar CNPJ:', error);
            setRazaoSocial('');
            setNomeFantasia('');
            setEndereco('');
            setCnpjErrorMessage('Erro ao buscar CNPJ');
          }
        } else {
          setRazaoSocial('');
          setNomeFantasia('');
          setEndereco('');
        }
      };

      const handleSubmit = (event) => {
        event.preventDefault();
        const config = {
          cnpj,
          razaoSocial,
          nomeFantasia,
          endereco,
          telefone,
          validadeOrcamento,
        };
        localStorage.setItem('configuracoes', JSON.stringify(config));
        setSaveMessage('Configurações salvas com sucesso!');
        setTimeout(() => setSaveMessage(''), 3000);
      };

      const handleAddSeller = () => {
        if (newSellerName && newSellerEmail) {
          setSellers([...sellers, { name: newSellerName, email: newSellerEmail }]);
          setNewSellerName('');
          setNewSellerEmail('');
        }
      };

      const handleRemoveSeller = (index) => {
        const newSellers = [...sellers];
        newSellers.splice(index, 1);
        setSellers(newSellers);
      };

      return (
        <div className="configuracoes-container">
          <h2>Configurações</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cnpj">CNPJ:</label>
              <input
                type="text"
                id="cnpj"
                value={cnpj}
                onChange={handleCNPJChange}
              />
              {cnpjErrorMessage && <p className="error-message">{cnpjErrorMessage}</p>}
            </div>
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
              <button type="button" onClick={() => setShowManageSellers(!showManageSellers)}>
                Gerenciar Vendedores
              </button>
              <button type="submit">Salvar Configurações</button>
            </div>
            {saveMessage && <p className="save-message">{saveMessage}</p>}
          </form>

          {showManageSellers && (
            <div className="manage-sellers">
              <h3>Gerenciar Vendedores</h3>
              <div className="add-seller-form">
                <input
                  type="text"
                  placeholder="Nome do Vendedor"
                  value={newSellerName}
                  onChange={(e) => setNewSellerName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email do Vendedor"
                  value={newSellerEmail}
                  onChange={(e) => setNewSellerEmail(e.target.value)}
                />
                <button onClick={handleAddSeller}>Adicionar Vendedor</button>
              </div>
              <ul className="sellers-list">
                {sellers.map((seller, index) => (
                  <li key={index}>
                    {seller.name} ({seller.email})
                    <button onClick={() => handleRemoveSeller(index)}>Remover</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    export default Configuracoes;
