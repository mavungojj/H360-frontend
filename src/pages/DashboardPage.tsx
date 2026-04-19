import { useEffect, useState } from 'react';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ patients: 0, appointments: 0, exams: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [patients, appointments, exams] = await Promise.all([
          api.get('/patients'),
          api.get('/appointments'),
          api.get('/exams'),
        ]);
        setStats({
          patients: patients.data.length,
          appointments: appointments.data.length,
          exams: exams.data.filter((e: any) => e.status === 'pending').length,
        });
      } catch {}
    }
    loadStats();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-gray-500 text-sm">Pacientes</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.patients}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-gray-500 text-sm">Consultas agendadas</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.appointments}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-gray-500 text-sm">Exames pendentes</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{stats.exams}</p>
        </div>
      </div>
    </div>
  );
}