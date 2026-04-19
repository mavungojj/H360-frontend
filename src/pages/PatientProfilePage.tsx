import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  address: string;
  medicalHistory: string;
  createdAt: string;
}

interface Appointment {
  id: number;
  scheduledAt: string;
  status: string;
  notes: string;
  user: { name: string };
}

interface Exam {
  id: number;
  type: string;
  status: string;
  result: string;
  labPartner: string;
  examDate: string;
  createdAt: string;
}

export default function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'appointments' | 'exams'>('info');
  const [editingHistory, setEditingHistory] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const [patientRes, apptRes, examRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/appointments/patient/${id}`),
        api.get(`/exams/patient/${id}`),
      ]);
      setPatient(patientRes.data);
      setMedicalHistory(patientRes.data.medicalHistory || '');
      setAppointments(apptRes.data);
      setExams(examRes.data);
    } finally {
      setLoading(false);
    }
  }

  async function saveMedicalHistory() {
    await api.put(`/patients/${id}`, { medicalHistory });
    setEditingHistory(false);
    loadData();
  }

  function statusBadge(status: string, type: 'appointment' | 'exam') {
    const config: Record<string, Record<string, string>> = {
      appointment: {
        scheduled: 'bg-blue-100 text-blue-700',
        done: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
      },
      exam: {
        pending: 'bg-amber-100 text-amber-700',
        done: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
      },
    };
    const labels: Record<string, string> = {
      scheduled: 'Agendada', done: 'Concluído',
      cancelled: 'Cancelado', pending: 'Pendente',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[type][status] ?? 'bg-gray-100 text-gray-600'}`}>
        {labels[status] ?? status}
      </span>
    );
  }

  if (loading) return <div className="p-6 text-gray-500">A carregar...</div>;
  if (!patient) return <div className="p-6 text-gray-500">Paciente não encontrado.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/patients')}
        className="text-sm text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-1"
      >
        ← Voltar aos pacientes
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{patient.name}</h2>
            <p className="text-gray-500 text-sm mt-1">
              Paciente desde {new Date(patient.createdAt).toLocaleDateString('pt-PT')}
            </p>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-700">Email</p>
              <p>{patient.email || '-'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Telefone</p>
              <p>{patient.phone || '-'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Género</p>
              <p>{patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Feminino' : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['info', 'appointments', 'exams'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab === 'info' ? 'Informações' : tab === 'appointments' ? `Consultas (${appointments.length})` : `Exames (${exams.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Histórico médico</h3>
            {!editingHistory && (
              <button
                onClick={() => setEditingHistory(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Editar
              </button>
            )}
          </div>
          {editingHistory ? (
            <div>
              <textarea
                value={medicalHistory}
                onChange={e => setMedicalHistory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                rows={6}
                placeholder="Descreve o histórico médico do paciente..."
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingHistory(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  Cancelar
                </button>
                <button onClick={saveMedicalHistory} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 whitespace-pre-wrap">
              {patient.medicalHistory || 'Nenhum histórico médico registado.'}
            </p>
          )}
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {appointments.length === 0 ? (
            <p className="p-6 text-gray-500">Nenhuma consulta registada.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Data</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Médico</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Estado</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Notas</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{new Date(a.scheduledAt).toLocaleString('pt-PT')}</td>
                    <td className="px-6 py-4 text-gray-600">{a.user?.name || '-'}</td>
                    <td className="px-6 py-4">{statusBadge(a.status, 'appointment')}</td>
                    <td className="px-6 py-4 text-gray-600">{a.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'exams' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {exams.length === 0 ? (
            <p className="p-6 text-gray-500">Nenhum exame registado.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Laboratório</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Estado</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Resultado</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Data</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(e => (
                  <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{e.type}</td>
                    <td className="px-6 py-4 text-gray-600">{e.labPartner || '-'}</td>
                    <td className="px-6 py-4">{statusBadge(e.status, 'exam')}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{e.result || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {e.examDate ? new Date(e.examDate).toLocaleDateString('pt-PT') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}