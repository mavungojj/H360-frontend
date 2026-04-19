import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "../services/api";

interface Stats {
  patients: number;
  appointments: number;
  exams: number;
  examsDone: number;
  appointmentsDone: number;
  appointmentsCancelled: number;
}

const COLORS = ["#2563eb", "#16a34a", "#d97706"];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    patients: 0,
    appointments: 0,
    exams: 0,
    examsDone: 0,
    appointmentsDone: 0,
    appointmentsCancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [patients, appointments, exams] = await Promise.all([
          api.get("/patients"),
          api.get("/appointments"),
          api.get("/exams"),
        ]);
        setStats({
          patients: patients.data.length,
          appointments: appointments.data.filter((a: any) => a.status === "scheduled").length,
          exams: exams.data.filter((e: any) => e.status === "pending").length,
          examsDone: exams.data.filter((e: any) => e.status === "done").length,
          appointmentsDone: appointments.data.filter((a: any) => a.status === "done").length,
          appointmentsCancelled: appointments.data.filter((a: any) => a.status === "cancelled").length,
        });
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const barData = [
    { name: "Agendadas", valor: stats.appointments },
    { name: "Realizadas", valor: stats.appointmentsDone },
    { name: "Canceladas", valor: stats.appointmentsCancelled },
  ];

  const pieData = [
    { name: "Pendentes", value: stats.exams },
    { name: "Concluidos", value: stats.examsDone },
  ];

  if (loading) return <div className="p-6 text-gray-500">A carregar...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-gray-500 text-sm">Total de pacientes</p>
          <p className="text-3xl font-bold mt-1" style={{ color: "#2563eb" }}>{stats.patients}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-gray-500 text-sm">Consultas agendadas</p>
          <p className="text-3xl font-bold mt-1" style={{ color: "#16a34a" }}>{stats.appointments}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-gray-500 text-sm">Exames pendentes</p>
          <p className="text-3xl font-bold mt-1" style={{ color: "#d97706" }}>{stats.exams}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Consultas por estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="valor" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado dos exames</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo geral</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{stats.patients}</p>
            <p className="text-sm text-gray-500 mt-1">Pacientes</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{stats.appointmentsDone}</p>
            <p className="text-sm text-gray-500 mt-1">Consultas realizadas</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{stats.examsDone}</p>
            <p className="text-sm text-gray-500 mt-1">Exames concluidos</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{stats.appointmentsCancelled}</p>
            <p className="text-sm text-gray-500 mt-1">Cancelamentos</p>
          </div>
        </div>
      </div>
    </div>
  );
}