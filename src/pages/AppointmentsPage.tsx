import { useState, useEffect } from 'react';
import api from '../services/api';

interface Appointment {
  id: number;
  scheduledAt: string;
  status: string;
  notes: string;
  patient: { id: number; name: string; phone: string };
  user: { id: number; name: string };
}

interface Patient {
  id: number;
  name: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: '', scheduledAt: '', notes: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [appts, pats] = await Promise.all([
        api.get('/appointments'),
        api.get('/patients'),
      ]);
      setAppointments(appts.data);
      setPatients(pats.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/appointments', {
      patientId: +form.patientId,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      notes: form.notes,
    });
    setForm({ patientId: '', scheduledAt: '', notes: '' });
    setShowForm(false);
    loadData();
  }

  async function updateStatus(id: number, status: string) {
    await api.put(`/appointments/${id}`, { status });
    loadData();
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-700',
      done: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      scheduled: 'Agendada',
      done: 'Realizada',
      cancelled: 'Cancelada',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {labels[status] ?? status}
      </span>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Consultas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Nova Consulta
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
            <select
              value={form.patientId}
              onChange={e => setForm({ ...form, patientId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecionar paciente...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data e hora</label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Guardar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">A carregar...</p>
      ) : appointments.length === 0 ? (
        <p className="text-gray-500">Nenhuma consulta encontrada.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Paciente</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Data</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Estado</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Notas</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{a.patient?.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(a.scheduledAt).toLocaleString('pt-PT')}
                  </td>
                  <td className="px-6 py-4">{statusBadge(a.status)}</td>
                  <td className="px-6 py-4 text-gray-600">{a.notes || '-'}</td>
                  <td className="px-6 py-4">
                    {a.status === 'scheduled' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(a.id, 'done')}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                        >
                          Realizada
                        </button>
                        <button
                          onClick={() => updateStatus(a.id, 'cancelled')}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}