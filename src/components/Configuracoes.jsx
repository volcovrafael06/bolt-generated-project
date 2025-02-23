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
  const [bandoCusto, setBandoCusto] = useState(80);
  const [bandoVenda, setBandoVenda] = useState(120);

  useEffect(() => {
    loadConfiguracoes();
    fetchSellers();
  }, [setCompanyLogo]);

  const loadConfiguracoes = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setCnpj(data.cnpj || '');
        setRazaoSocial(data.razao_social || '');
        setNomeFantasia(data.nome_fantasia || '');
        setEndereco(data.endereco || '');
        setTelefone(data.telefone || '');
        setValidadeOrcamento(data.validade_orcamento || 30);
        setFormulaM2(data.formula_m2 || '');
        setFormulaComprimento(data.formula_comprimento || '');
        setFormulaBando(data.formula_bando || '');
        setFormulaInstalacao(data.formula_instalacao || '');
        setLocalCompanyLogo(data.company_logo || null);
        setCompanyLogo(data.company_logo || null);
        setBandoCusto(data.bando_custo || 80);
        setBandoVenda(data.bando_venda || 120);
      }
    } catch (err) {
      setError(err.message);
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
    handleLogoUpload(e);
  };

  const handleLogoUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Check file size (max 200KB)
      if (file.size > 200 * 1024) {
        setError('O arquivo é muito grande. O tamanho máximo é 200KB.');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem válido.');
        return;
      }

      setLoading(true);

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;

      // Upload the file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(`logos/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Erro ao fazer upload do arquivo: ' + uploadError.message);
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(`logos/${fileName}`);

      // Update local state and parent component
      setLocalCompanyLogo(publicUrl);
      setCompanyLogo(publicUrl);

      // Save to database
      const { error: dbError } = await supabase
        .from('configuracoes')
        .update({ 
          company_logo: publicUrl 
        })
        .eq('id', 1);

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Erro ao salvar no banco de dados: ' + dbError.message);
      }

      setSaveMessage('Logo atualizado com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);

    } catch (error) {
      console.error('Error uploading logo:', error);
      setError(error.message || 'Erro ao fazer upload do logo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    handleSave();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const updates = {
        cnpj,
        razao_social: razaoSocial,
        nome_fantasia: nomeFantasia,
        endereco,
        telefone,
        validade_orcamento: validadeOrcamento,
        formula_m2: formulaM2,
        formula_comprimento: formulaComprimento,
        formula_bando: formulaBando,
        formula_instalacao: formulaInstalacao,
        company_logo: localCompanyLogo,
        bando_custo: bandoCusto,
        bando_venda: bandoVenda
      };

      const { error } = await supabase
        .from('configuracoes')
        .update(updates)
        .eq('id', 1);

      if (error) throw error;

      setSaveMessage('Configurações salvas com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSeller = async (e) => {
    e.preventDefault();
    if (!newSellerName || !newSellerEmail) return;

    try {
      const { data, error } = await supabase
        .from('sellers')
        .insert([
          { name: newSellerName, email: newSellerEmail }
        ]);

      if (error) throw error;

      // Refresh sellers list
      fetchSellers();

      // Clear form
      setNewSellerName('');
      setNewSellerEmail('');
    } catch (err) {
      setError(err.message);
      console.error("Error adding seller:", err);
    }
  };

  const handleRemoveSeller = async (sellerId) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .delete()
        .eq('id', sellerId);

      if (error) throw error;

      // Refresh sellers list
      fetchSellers();
    } catch (err) {
      setError(err.message);
      console.error("Error deleting seller:", err);
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('company_logo')
        .single();

      if (error) {
        console.error('Error fetching logo:', error);
      } else if (data?.company_logo) {
        setLocalCompanyLogo(data.company_logo);
        setCompanyLogo(data.company_logo);
      }
    };

    fetchConfig();
  }, [setCompanyLogo]);

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
        <div className="config-section">
          <h3>Configurações de Preços</h3>
          <div className="form-group">
            <label>Preço de Custo do Bandô (por metro):</label>
            <input
              type="number"
              value={bandoCusto}
              onChange={(e) => setBandoCusto(parseFloat(e.target.value))}
              step="0.01"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Preço de Venda do Bandô (por metro):</label>
            <input
              type="number"
              value={bandoVenda}
              onChange={(e) => setBandoVenda(parseFloat(e.target.value))}
              step="0.01"
              min="0"
            />
          </div>
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
