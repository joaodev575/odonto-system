import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/App";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboards";
import Pacientes from "./pages/Pacientes";
import Doutores from "./pages/Doutores";
import Consultas from "./pages/Consultas";
import Calendario from "./pages/Calendario";
import Configuracoes from "./pages/Configuracoes";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const userStr = localStorage.getItem("user");
  if (!userStr) return <Navigate to="/" replace />;
  try {
    const user = JSON.parse(userStr);
    if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  } catch { return <Navigate to="/" replace />; }
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/esqueci-senha" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/pacientes" element={<ProtectedRoute><Pacientes /></ProtectedRoute>} />
      <Route path="/doutores" element={<ProtectedRoute><Doutores /></ProtectedRoute>} />
      <Route path="/consultas" element={<ProtectedRoute><Consultas /></ProtectedRoute>} />
      <Route path="/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
