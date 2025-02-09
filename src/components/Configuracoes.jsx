import React, { useState, useRef, useEffect } from 'react';

function Configuracoes({ setCompanyLogo, setValidadeOrcamento, validadeOrcamento }) { // Ensure validadeOrcamento is in props
  const [showNewSellerForm, setShowNewSellerForm] = useState(false);
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerPassword, setNewSellerPassword] = useState('');
  const [showSellerMenu, setShowSellerMenu] = useState(false);
  const [sellers, setSellers] = useState([
    { id: 1, name: 'Vendedor 1', status: 'ativo' },
    { id: 2, name: 'Vendedor 2', status: 'ativo' },
  ]);

  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [logoEmpresa, setLogoEmpresa] = useState(null);
  const [validadeOrcamentoLocal, setValidadeOrcamentoLocal] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    // Initialize local state with prop value on mount or when prop changes
    setValidadeOrcamentoLocal(validadeOrcamento);
  }, [validadeOrcamento]);


  const menuRef = useRef(null);

  const handleToggleSellerMenu = () => {
    setShowSellerMenu(!showSellerMenu);
    setShowNewSellerForm(false);
  };

  const handleDeleteSeller = (sellerId) => {
    const updatedSellers = sellers.filter(seller => seller.id !== sellerId);
    setSellers(updatedSellers);
    alert(`Vendedor com ID ${sellerId} excluído com sucesso!`);
  };

  const handleBlockSeller = (sellerId) => {
    const updatedSellers = sellers.map(seller =>
      seller.id === sellerId ? { ...seller, status: seller.status === 'ativo' ? 'bloqueado' : 'ativo' } : seller
    );
    setSellers(updatedSellers);
    const seller = sellers.find(seller => seller.id === sellerId);
    const newStatus = seller.status === 'ativo' ? 'bloqueado' : 'ativo';
    alert(`Vendedor com ID ${sellerId} ${newStatus === 'bloqueado' ? 'bloqueado' : 'reativado'} com sucesso!`);
  };


  const handleEditSeller = (sellerId) => {
    alert(`Opção de editar vendedor com ID ${sellerId} será implementada.`);
  };

  const handleCreateSellerMenuClick = () => {
    setShowNewSellerForm(true);
    setShowSellerMenu(false);
  };

  const handleCancelCreateSeller = () => {
    setShowNewSellerForm(false);
    setNewSellerName('');
    setNewSellerPassword('');
  };

  const handleCreateNewSeller = () => {
    const newSeller = { id: sellers.length + 1, name: newSellerName, status: 'ativo' };
    setSellers([...sellers, newSeller]);
    alert(`Novo vendedor "${newSellerName}" criado com sucesso! (Senha: ${newSellerPassword})`);
    setShowNewSellerForm(false);
    setNewSellerName('');
    setNewSellerPassword('');
  };

  const handleSaveConfiguracoes = () => {
    const configuracoes = {
      razaoSocial,
      nomeFantasia,
      endereco,
      telefone,
      logoEmpresa: logoEmpresa ? logoEmpresa.name : null,
      validadeOrcamento: validadeOrcamentoLocal,
    };
    alert(`Configurações salvas com sucesso!\n\n${JSON.stringify(configuracoes, null, 2)}`);
    setCompanyLogo(logoEmpresa);
    setValidadeOrcamento(validadeOrcamentoLocal);
  };

  const handleLogoEmpresaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 200000) {
        alert("O tamanho do logo deve ser menor que 200KB.");
        e.target.value = '';
        setLogoEmpresa(null);
        setLogoPreview(null);
        return;
      }
      setLogoEmpresa(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoEmpresa(null);
      setLogoPreview(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('button[onClick="handleToggleSellerMenu"]')) {
        setShowSellerMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);


  return (
    <div>
      <h2>Configurações</h2>
      <form>
        <div>
          <label htmlFor="razaoSocial">Razão Social:</label>
          <input type="text" id="razaoSocial" name="razaoSocial" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
        </div>
        <div>
          <label htmlFor="nomeFantasia">Nome Fantasia:</label>
          <input type="text" id="nomeFantasia" name="nomeFantasia" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
        </div>
        <div>
          <label htmlFor="endereco">Endereço:</label>
          <input type="text" id="endereco" name="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
        </div>
        <div>
          <label htmlFor="telefone">Telefone:</label>
          <input type="tel" id="telefone" name="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </div>
        <div>
          <label htmlFor="logoEmpresa">Anexar Logo da Empresa (Max 200KB):</label>
          <input type="file" id="logoEmpresa" name="logoEmpresa" onChange={handleLogoEmpresaChange} />
          {logoPreview && (
            <div>
              <p>Pré-visualização do Logo:</p>
              <img src={logoPreview} alt="Pré-visualização do Logo" style={{ maxHeight: '100px' }} />
            </div>
          )}
        </div>
        <div>
          <label htmlFor="validadeOrcamento">Validade do Orçamento (dias):</label>
          <input type="number" id="validadeOrcamento" name="validadeOrcamento" value={validadeOrcamentoLocal} onChange={(e) => setValidadeOrcamentoLocal(e.target.value)} />
        </div>

        <div style={{ position: 'relative' }}>
          <button type="button" onClick={handleToggleSellerMenu}>Gerenciar Vendedores</button>
          {showSellerMenu && (
            <div ref={menuRef} className="seller-menu dropdown">
              <h3>Vendedores</h3>
              <ul>
                {sellers.map(seller => (
                  <li key={seller.id}>
                    {seller.name} ({seller.status})
                    <div>
                      <button type="button" onClick={() => handleEditSeller(seller.id)}>Alterar</button>
                      <button type="button" onClick={() => handleBlockSeller(seller.id)}>
                        {seller.status === 'ativo' ? 'Bloquear' : 'Desbloquear'}
                      </button>
                      <button type="button" onClick={() => handleDeleteSeller(seller.id)}>Excluir</button>
                    </div>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={handleCreateSellerMenuClick}>Criar Novo Vendedor</button>
            </div>
          )}
        </div>

        {showNewSellerForm && (
          <div className="new-seller-form">
            <h3>Criar Novo Vendedor</h3>
            <div>
              <label htmlFor="newSellerName">Nome do Vendedor:</label>
              <input type="text" id="newSellerName" name="newSellerName" value={newSellerName} onChange={(e) => setNewSellerName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="newSellerPassword">Senha:</label>
              <input type="password" id="newSellerPassword" name="newSellerPassword" value={newSellerPassword} onChange={(e) => setNewSellerPassword(e.target.value)} />
            </div>
            <div>
              <button type="button" onClick={handleCreateNewSeller}>Criar Vendedor</button>
              <button type="button" onClick={handleCancelCreateSeller}>Cancelar</button>
            </div>
          </div>
        )}

        <div>
          <button type="button" onClick={handleSaveConfiguracoes}>Salvar Configurações</button>
        </div>
      </form>
    </div>
  );
}

export default Configuracoes;
