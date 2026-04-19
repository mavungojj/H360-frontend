import { useState, useEffect } from 'react';
import api from '../services/api';

interface Exam {
  id: number;
  type: string;
  status: string;
  result: string;
  labPartner: string;
  examDate: string;
  createdAt: string;
  patient: { id: number; name: string };
}

interface Patient {
  id: number;
  name: string;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showResult, setShowResult] = useState<number | null>(null);
  const [result, setResult] = useState('');
  const [form, setForm] = useState({ patientId: '', type: '', labPartner: '', examDate: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [examsRes, patientsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/patients'),
      ]);
      setExams(examsRes.data);
      setPatients(patientsRes.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/exams', {
      patientId: +form.patientId,
      type: form.type,
      labPartner: form.labPartner,
      examDate: form.examDate ? new Date(form.examDate).toISOString() : undefined,
    });
    setForm({ patientId: '', type: '', labPartner: '', examDate: '' });
    setShowForm(false);
    loadData();
  }

  async function handleResult(id: number) {
    await api.put(`/exams/${id}`, { result, status: 'done' });
    setShowResult(null);
    setResult('');
    loadData();
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      done: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      pending: 'Pendente',
      done: 'Concluído',
      cancelled: 'Cancelado',
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
        <h2 className="text-2xl font-bold text-gray-800">Exames</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Novo Exame
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de exame</label>
            <input
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ex: Hemograma completo"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Laboratório</label>
            <input
              value={form.labPartner}
              onChange={e => setForm({ ...form, labPartner: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ex: Lab Central"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data do exame</label>
            <input
              type="datetime-local"
              value={form.examDate}
              onChange={e => setForm({ ...form, examDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {showResult !== null && (
        <div className="bg-white p-6 rounded-xl border border-blue-200 mb-6">
          <h3 className="font-medium text-gray-800 mb-3">Registar resultado</h3>
          <textarea
            value={result}
            onChange={e => setResult(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            rows={4}
            placeholder="Descreve o resultado do exame..."
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowResult(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={() => handleResult(showResult)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Guardar resultado
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">A carregar...</p>
      ) : exams.length === 0 ? (
        <p className="text-gray-500">Nenhum exame encontrado.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Paciente</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Tipo</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Laboratório</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Estado</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Resultado</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(e => (
                <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{e.patient?.name}</td>
                  <td className="px-6 py-4 text-gray-600">{e.type}</td>
                  <td className="px-6 py-4 text-gray-600">{e.labPartner || '-'}</td>
                  <td className="px-6 py-4">{statusBadge(e.status)}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{e.result || '-'}</td>
                  <td className="px-6 py-4">
                    {e.status === 'pending' && (
                      <button
                        onClick={() => { setShowResult(e.id); setResult(''); }}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        Registar resultado
                      </button>
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