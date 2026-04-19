import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ExamsPage from './pages/ExamsPage';
import PatientProfilePage from './pages/PatientProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';
import UsersPage from "./pages/UsersPage";

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-blue-600">H360</h1>
          <div className="flex gap-4">
            <NavLink to="/dashboard" className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`
            }>Dashboard</NavLink>
            <NavLink to="/patients" className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`
            }>Pacientes</NavLink>
            <NavLink to="/appointments" className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`
            }>Consultas</NavLink>
            <NavLink to="/exams" className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`
            }>Exames</NavLink>
            <NavLink to="/users" className={({ isActive }) =>
              `text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-800"}`
            }>Funcionarios</NavLink>
            <NavLink to="/subscription" className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`
            }>Subscrição</NavLink>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">{user?.name}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">Sair</button>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">A carregar...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>
      } />
      <Route path="/patients" element={
        <PrivateRoute><Layout><PatientsPage /></Layout></PrivateRoute>
      } />
      <Route path="/patients/:id" element={
        <PrivateRoute><Layout><PatientProfilePage /></Layout></PrivateRoute>
      } />
      <Route path="/appointments" element={
        <PrivateRoute><Layout><AppointmentsPage /></Layout></PrivateRoute>
      } />
      <Route path="/exams" element={
        <PrivateRoute><Layout><ExamsPage /></Layout></PrivateRoute>
      } />
      <Route path="/users" element={
        <PrivateRoute><Layout><UsersPage /></Layout></PrivateRoute>
      } />
      <Route path="/subscription" element={
        <PrivateRoute><Layout><SubscriptionPage /></Layout></PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}