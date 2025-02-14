import React, { useState, useEffect } from 'react';
    import './Configuracoes.css';
    import { supabase } from '../supabase/client';

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
      const [sellers, setSellers] = useState([]);
      const [newSellerName, setNewSellerName] = useState('');
      const [newSellerEmail, setNewSellerEmail] = useState('');
      const [saveMessage, setSaveMessage] = useState('');
      const [cnpjErrorMessage, setCnpjErrorMessage] = useState('');
      const [localCompanyLogo, setLocalCompanyLogo] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);


      useEffect(() => {
        fetchConfig();
        fetchSellers();
      }, [setCompanyLogo]);

      const fetchConfig = async () => {
        setLoading(true);
        try {
          let { data, error } = await supabase.from('configuracoes').select('*').single();
          if (error && error.code !== 'PGRST116') { // Ignore "No rows found" error
            throw error;
          }

          if (data) {
            setCnpj(data.cnpj || '');
            setRazaoSocial(data.razaoSocial || '');
            setNomeFantasia(data.nomeFantasia || '');
            setEndereco(data.endereco || '');
            setTelefone(data.telefone || '');
            setValidadeOrcamento(data.validadeOrcamento || 30);
            setFormulaM2(data.formulaM2 || '');
            setFormulaComprimento(data.formulaComprimento || '');
            setFormulaBando(data.formulaBando || '');
            setFormulaInstalacao(data.formulaInstalacao || '');
            setLocalCompanyLogo(data.companyLogo || null);
            setCompanyLogo(data.companyLogo || null);
          }
        } catch (err) {
          setError(err.message);
          console.error("Error fetching config:", err);
        } finally {
          setLoading(false);
        }
      };

      const fetchSellers = async () => {
        setLoading(true);
        try {
          let { data: sellersData, error: sellersError } = await supabase.from('sellers').select('*');
          if (sellersError) throw sellersError;
          setSellers(sellersData || []);
        } catch (err) {
          setError(err.message);
          console.error("Error fetching sellers:", err);
        } finally {
          setLoading(false);
        }
      };

      const handleCNPJChange = async (e) => {
        const value = e.target.value;
        setCnpj(value);

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

              const estabelecimento = data.estabelecimento || {};
              const logradouro = estabelecimento.logradouro || '';
              const numero = estabelecimento.numero || '';
              const bairro = estabelecimento.bairro || '';
              const municipio = estabelecimento.municipio || '';
              const uf = estabelecimento.uf || '';
              const cep = estabelecimento.cep || '';

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

      const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const configData = {
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

        try {
          let { data, error: updateError } = await supabase.from('configuracoes').upsert(configData, { onConflict: 'cnpj' }).select();

          if (updateError) throw updateError;

          setSaveMessage('Configurações salvas com sucesso!');
          setTimeout(() => setSaveMessage(''), 3000);

        } catch (err) {
          setError(err.message);
          console.error("Error saving config:", err);
        } finally {
          setLoading(false);
        }
      };

      const handleAddSeller = async () => {
        if (!newSellerName || !newSellerEmail) return;

        setLoading(true);
        setError(null);
        try {
          const { data, error: insertError } = await supabase.from('sellers').insert([{ name: newSellerName, email: newSellerEmail }]).select();
          if (insertError) throw insertError;
          setSellers([...sellers, ...data]);
          setNewSellerName('');
          setNewSellerEmail('');
        } catch (err) {
          setError(err.message);
          console.error("Error adding seller:", err);
        } finally {
          setLoading(false);
        }
      };

      const handleRemoveSeller = async (sellerId) => {
        setLoading(true);
        setError(null);
        try {
          const { error: deleteError } = await supabase.from('sellers').delete().eq('id', sellerId);
          if (deleteError) throw deleteError;
          setSellers(sellers.filter(seller => seller.id !== sellerId));
        } catch (err) {
          setError(err.message);
          console.error("Error removing seller:", err);
        } finally {
          setLoading(false);
        }
      };

      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error: {error}</p>;

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
              <button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </button>
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
                <button onClick={handleAddSeller} disabled={loading}>
                  {loading ? 'Adicionando...' : 'Adicionar Vendedor'}
                </button>
              </div>
              <ul className="sellers-list">
                {sellers.map((seller) => (
                  <li key={seller.id}>
                    {seller.name} ({seller.email})
                    <button onClick={() => handleRemoveSeller(seller.id)} disabled={loading}>
                      {loading ? 'Removendo...' : 'Remover'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {localCompanyLogo && (
            <div>
              <h3>Logo Preview:</h3>
              <img src={localCompanyLogo} alt="Company Logo Preview" style={{ maxWidth: '200px' }} />
            </div>
          )}
        </div>
      );
    }

    export default Configuracoes;
