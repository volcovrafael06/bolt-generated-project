import React, { useState, useEffect } from 'react';
import './Configuracoes.css';

function Configuracoes({ setCompanyLogo }) {
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [validadeOrcamento, setValidadeOrcamento] = useState(30);
  const [formulaM2, setFormulaM2] = useState('');
  const [formulaComprimento, setFormulaComprimento] = useState('');
  const [formulaBando, setFormulaBando] = useState('');
  const [formulaInstalacao, setFormulaInstalacao] = useState('');
  const [showManageSellers, setShowManageSellers] = useState(false);
  const [sellers, setSellers] = useState(() => {
    const storedSellers = localStorage.getItem('sellers');
    return storedSellers ? JSON.parse(storedSellers) : [];
  });
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerEmail, setNewSellerEmail] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [cnpjErrorMessage, setCnpjErrorMessage] = useState('');
  const [localCompanyLogo, setLocalCompanyLogo] = useState(null);

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
      setFormulaM2(config.formulaM2 || '');
      setFormulaComprimento(config.formulaComprimento || '');
      setFormulaBando(config.formulaBando || '');
      setFormulaInstalacao(config.formulaInstalacao || '');
      setLocalCompanyLogo(config.companyLogo || null);
      setCompanyLogo(config.companyLogo || null);
    }
  }, [setCompanyLogo]);

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

          // Construct the address from the API data
          const estabelecimento = data.estabelecimento || {};
          const logradouro = estabelecimento.logradouro || '';
          const numero = estabelecimento.numero || '';
          const bairro = estabelecimento.bairro || '';
          const municipio = estabelecimento.municipio || '';
          const uf = estabelecimento.uf || '';
          const cep = estabelecimento.cep || '';

          // Build address string, handling missing parts gracefully
          let addressParts = [];
          if (logradouro) addressParts.push(logradouro);
          if (numero) addressParts.push(numero);
          if (bairro) addressParts.push(bairro);
          if (municipio) addressParts.push(municipio);
          if (uf) addressParts.push(uf);
          if (cep) addressParts.push(cep);

          const address = addressParts.filter(part => part !== '').join(', ');
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setLocalCompanyLogo(base64String);
        setCompanyLogo(base64String);
      };
      reader.readAsDataURL(file);
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
      formulaM2,
      formulaComprimento,
      formulaBando,
      formulaInstalacao,
      companyLogo: localCompanyLogo,
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
          <input type="file" id="logo" onChange={handleLogoChange} />
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
        <div className="form-group">
          <label htmlFor="formulaM2">Fórmula para Cálculo de M2:</label>
          <input
            type="text"
            id="formulaM2"
            value={formulaM2}
            onChange={(e) => setFormulaM2(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="formulaComprimento">Fórmula para Cálculo de Comprimento:</label>
          <input
            type="text"
            id="formulaComprimento"
            value={formulaComprimento}
            onChange={(e) => setFormulaComprimento(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="formulaBando">Fórmula para Cálculo de Bando:</label>
          <input
            type="text"
            id="formulaBando"
            value={formulaBando}
            onChange={(e) => setFormulaBando(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="formulaInstalacao">Fórmula para Cálculo de Instalação:</label>
          <input
            type="text"
            id="formulaInstalacao"
            value={formulaInstalacao}
            onChange={(e) => setFormulaInstalacao(e.target.value)}
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
        {localCompanyLogo && (
        <div>
          <h3>Logo Preview:</h3>
          <img src={localCompanyLogo} alt="Company Logo Preview" style={{maxWidth: '200px'}}/>
        </div>
      )}
    </div>
  );
}

export default Configuracoes;
