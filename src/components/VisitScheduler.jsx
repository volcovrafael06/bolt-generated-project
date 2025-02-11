import React, { useState, useEffect } from 'react';

function VisitScheduler() {
  const [visits, setVisits] = useState([]);
  const [newVisit, setNewVisit] = useState({
    customerName: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    dateTime: '',
    notes: '',
  });
  const [editingVisitId, setEditingVisitId] = useState(null);

  const handleInputChange = (e) => {
    setNewVisit({ ...newVisit, [e.target.name]: e.target.value });
  };

  const handleCepChange = (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    setNewVisit({ ...newVisit, cep });

    if (cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
          if (data.erro) {
            alert('CEP não encontrado.');
          } else {
            setNewVisit(prevVisit => ({
              ...prevVisit,
              address: data.logradouro,
              city: data.localidade,
              state: data.uf,
              neighborhood: data.bairro,
            }));
          }
        })
        .catch(error => {
          console.error('Erro ao consultar CEP:', error);
          alert('Erro ao consultar CEP.');
        });
    } else if (cep.length !== 8 && newVisit.address !== '') {
        setNewVisit(prevVisit => ({
            ...prevVisit,
            address: '',
            city: '',
            state: '',
            neighborhood: '',
        }));
    }
  };

  const handleScheduleVisit = (e) => {
    e.preventDefault();
    if (
      newVisit.customerName &&
      newVisit.dateTime &&
      newVisit.cep &&
      newVisit.address &&
      newVisit.number &&
      newVisit.city &&
      newVisit.state
    ) {
      const visitData = {
        ...newVisit,
        dateTime: new Date(newVisit.dateTime).toLocaleString(), // Format the date
      };
      if (editingVisitId) {
        const updatedVisits = visits.map((visit) =>
          visit.id === editingVisitId ? { ...visitData, id: editingVisitId } : visit
        );
        setVisits(updatedVisits);
        alert(`Visita de ${newVisit.customerName} reagendada com sucesso!`);
      } else {
        setVisits([...visits, { ...visitData, id: Date.now() }]);
        alert(`Visita para ${newVisit.customerName} agendada com sucesso!`);
      }
      setNewVisit({
        customerName: '',
        cep: '',
        address: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        dateTime: '',
        notes: '',
      });
      setEditingVisitId(null);
    } else {
      alert(
        'Por favor, preencha todos os campos obrigatórios, incluindo o número do endereço.'
      );
    }
  };

  const handleEditVisit = (visitId) => {
    const visitToEdit = visits.find((visit) => visit.id === visitId);
    if (visitToEdit) {
      setNewVisit({
        ...visitToEdit,
        dateTime: new Date(visitToEdit.dateTime).toISOString().slice(0, 16),
      });
      setEditingVisitId(visitId);
    }
  };

  const handleCancelEdit = () => {
    setNewVisit({
      customerName: '',
      cep: '',
      address: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      dateTime: '',
      notes: '',
    });
    setEditingVisitId(null);
  };

  const handleConfirmVisit = (visitId) => {
    alert(`Funcionalidade de confirmar visita ${visitId} será implementada.`);
  };

  return (
    <div>
      <h3>{editingVisitId ? 'Editar Agendamento de Visita' : 'Agendar Visita para Orçamento'}</h3>
      <form onSubmit={handleScheduleVisit}>
        <div className="form-group">
          <label htmlFor="customerName">Cliente:</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={newVisit.customerName}
            onChange={handleInputChange}
            placeholder="Nome do Cliente"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cep">CEP:</label>
          <input
            type="text"
            id="cep"
            name="cep"
            value={newVisit.cep}
            onChange={handleCepChange}
            placeholder="CEP"
            maxLength="9"
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Rua:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={newVisit.address}
            onChange={handleInputChange}
            placeholder="Rua"
            required
            readOnly
          />
        </div>
        <div className="form-group">
          <label htmlFor="number">Número:</label>
          <input
            type="text"
            id="number"
            name="number"
            value={newVisit.number}
            onChange={handleInputChange}
            placeholder="Número"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="complement">Complemento:</label>
          <input
            type="text"
            id="complement"
            name="complement"
            value={newVisit.complement}
            onChange={handleInputChange}
            placeholder="Complemento"
          />
        </div>
        <div className="form-group">
          <label htmlFor="neighborhood">Bairro:</label>
          <input
            type="text"
            id="neighborhood"
            name="neighborhood"
            value={newVisit.neighborhood}
            onChange={handleInputChange}
            placeholder="Bairro"
            required
            readOnly
          />
        </div>
        <div className="form-group">
          <label htmlFor="city">Cidade:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={newVisit.city}
            onChange={handleInputChange}
            placeholder="Cidade"
            required
            readOnly
          />
        </div>
        <div className="form-group">
          <label htmlFor="state">Estado:</label>
          <input
            type="text"
            id="state"
            name="state"
            value={newVisit.state}
            onChange={handleInputChange}
            placeholder="Estado"
            required
            readOnly
          />
        </div>
        <div className="form-group">
          <label htmlFor="dateTime">Data e Hora:</label>
          <input
            type="datetime-local"
            id="dateTime"
            name="dateTime"
            value={newVisit.dateTime}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="notes">Observações:</label>
          <textarea
            id="notes"
            name="notes"
            value={newVisit.notes}
            onChange={handleInputChange}
            placeholder="Observações adicionais"
          />
        </div>
        <button type="submit">{editingVisitId ? 'Salvar Agendamento' : 'Agendar Visita'}</button>
        {editingVisitId && (
          <button type="button" onClick={handleCancelEdit}>Cancelar Edição</button>
        )}
      </form>

      <h4>Visitas Agendadas</h4>
      {visits.length > 0 ? (
        <ul>
          {visits.map((visit) => (
            <li
              key={visit.id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <strong>{visit.customerName}</strong> - {visit.dateTime} - CEP: {visit.cep} -
                Endereço: {visit.address}, {visit.number}, {visit.complement ? `Complemento: ${visit.complement}, ` : ''}{' '}
                {visit.neighborhood}, {visit.city}, {visit.state}
                {visit.notes && <p>Notas: {visit.notes}</p>}
              </div>
              <div>
                <button style={{ marginLeft: '5px' }} onClick={() => handleEditVisit(visit.id)}>
                  Editar
                </button>
                <button style={{ marginLeft: '5px' }} onClick={() => handleConfirmVisit(visit.id)}>
                  Confirmar Visita
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma visita agendada.</p>
      )}
    </div>
  );
}

export default VisitScheduler;
