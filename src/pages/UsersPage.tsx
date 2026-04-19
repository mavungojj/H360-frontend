import { useState, useEffect } from "react";
import api from "../services/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const roles = [
  { id: "admin", name: "Administrador" },
  { id: "doctor", name: "Medico" },
  { id: "nurse", name: "Enfermeiro" },
  { id: "staff", name: "Recepcionista" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "staff" });

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/users", form);
    setForm({ name: "", email: "", password: "", role: "staff" });
    setShowForm(false);
    loadUsers();
  }

  async function handleDelete(id: number) {
    if (!confirm("Tens a certeza que queres remover este utilizador?")) return;
    await api.delete(`/users/${id}`);
    loadUsers();
  }

  function roleName(role: string) {
    return roles.find(r => r.id === role)?.name ?? role;
  }

  function roleBadge(role: string) {
    const colors: Record<string, string> = {
      admin: "bg-purple-100 text-purple-700",
      doctor: "bg-blue-100 text-blue-700",
      nurse: "bg-green-100 text-green-700",
      staff: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] ?? "bg-gray-100 text-gray-600"}`}>
        {roleName(role)}
      </span>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Funcionarios</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Novo Funcionario
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Funcao</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
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
      ) : users.length === 0 ? (
        <p className="text-gray-500">Nenhum funcionario encontrado.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Nome</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Email</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Funcao</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Desde</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{u.name}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">{roleBadge(u.role)}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(u.createdAt).toLocaleDateString("pt-PT")}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Remover
                    </button>
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
