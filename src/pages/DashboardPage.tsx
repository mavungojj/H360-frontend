import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">H360</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Sair
          </button>
        </div>
      </nav>
      <main className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">Pacientes</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">Consultas hoje</p>
            <p className="text-3xl font-bold text-green-600 mt-1">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">Exames pendentes</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">0</p>
          </div>
        </div>
      </main>
    </div>
  );
}