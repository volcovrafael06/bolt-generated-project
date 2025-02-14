import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    setError(null);
    try {
      let { data: visitsData, error: fetchError } = await supabase
        .from('visits')
        .select('*');

      if (fetchError) throw fetchError;
      setVisits(visitsData || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (
      !newVisit.customerName ||
      !newVisit.dateTime ||
      !newVisit.cep ||
      !newVisit.address ||
      !newVisit.number ||
      !newVisit.city ||
      !newVisit.state
    ) {
      alert('Por favor, preencha todos os campos obrigatórios, incluindo o número do endereço.');
      return;
    }

    setLoading(true);
    setError(null);

    const visitData = {
      ...newVisit,
      dateTime: new Date(newVisit.dateTime).toISOString(), // Store as ISO string
    };

    try {
      if (editingVisitId) {
        const { error: updateError } = await supabase
          .from('visits')
          .update(visitData)
          .eq('id', editingVisitId);

        if (updateError) throw updateError;

        const updatedVisits = visits.map((visit) =>
          visit.id === editingVisitId ? { ...visitData, id: editingVisitId } : visit
        );
        setVisits(updatedVisits);
        alert(`Visita de ${newVisit.customerName} reagendada com sucesso!`);
      } else {
        const { data, error: insertError } = await supabase
          .from('visits')
          .insert([visitData])
          .select();

        if (insertError) throw insertError;

        setVisits([...visits, ...data]);
        alert(`Visita para ${newVisit.customerName} agendada com sucesso!`);
      }

      // Reset form
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
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVisit = (visitId) => {
    const visitToEdit = visits.find((visit) => visit.id === visitId);
    if (visitToEdit) {
      setNewVisit({
        ...visitToEdit,
        dateTime: new Date(visitToEdit.dateTime).toISOString().slice(0, 16), // Format for datetime-local
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

  const handleConfirmVisit = async (visitId) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('visits')
        .update({ status: 'confirmed' })
        .eq('id', visitId);

      if (error) throw error;
      alert(`Visita de ${visits.find(v => v.id === visitId).customerName} confirmada com sucesso!`);

      // Update local state to remove the confirmed visit
      setVisits(visits.filter(v => v.id !== visitId));

    } catch (err) {
      setError(err.message);
      console.error("Error confirming visit:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

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
        <button type="submit" disabled={loading}>{editingVisitId ? 'Salvar Agendamento' : 'Agendar Visita'}</button>
        {editingVisitId && (
          <button type="button" onClick={handleCancelEdit} disabled={loading}>Cancelar Edição</button>
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
                <strong>{visit.customerName}</strong> - {new Date(visit.dateTime).toLocaleString()} - CEP: {visit.cep} -
                Endereço: {visit.address}, {visit.number}, {visit.complement ? `Complemento: ${visit.complement}, ` : ''}{' '}
                {visit.neighborhood}, {visit.city}, {visit.state}
                {visit.notes && <p>Notas: {visit.notes}</p>}
                <p>Status: {visit.status}</p>
              </div>
              <div>
                <button style={{ marginLeft: '5px' }} onClick={() => handleEditVisit(visit.id)} disabled={loading}>
                  {loading ? 'Editando...' : 'Editar'}
                </button>
                <button style={{ marginLeft: '5px' }} onClick={() => handleConfirmVisit(visit.id)} disabled={loading}>
                  {loading ? 'Confirmando...' : 'Confirmar Visita'}
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
