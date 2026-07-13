import { useState, useEffect, useCallback } from "react";
import NavBar from "#components/NavBar";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";

interface AdminStats {
  totalUsers: number; totalPacientes: number; totalDoutores: number;
  totalConsultas: number; consultasHoje: number; consultasMes: number;
  usuariosAtivos: number; faturamentoMes: number;
  servidor: string; uptime: number; memoria: number;
}

interface User {
  id: string; username: string; email?: string; role: string;
  createdAt: string; updatedAt: string;
}

interface AuditEntry {
  tipo: string; acao: string; data: string;
}

interface HealthData {
  status: string; database: string; uptime: number; memoryMB: number; timestamp: string;
}

const API_BASE = "/api";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "audit" | "settings">("overview");

  // Create user form
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [creatingUser, setCreatingUser] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const { toast } = useToast();

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [sRes, uRes, aRes, hRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`, { headers }),
        fetch(`${API_BASE}/admin/users`, { headers }),
        fetch(`${API_BASE}/admin/audit`, { headers }),
        fetch(`${API_BASE}/admin/health`, { headers }),
      ]);
      const [sData, uData, aData, hData] = await Promise.all([sRes.json(), uRes.json(), aRes.json(), hRes.json()]);
      if (sData.success) setStats(sData.data);
      if (uData.success) setUsers(uData.data);
      if (aData.success) setAudit(aData.data);
      if (hData.success) setHealth(hData.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) { toast("Username e senha sao obrigatorios", "error"); return; }
    if (newPassword.length < 8) { toast("Senha deve ter pelo menos 8 caracteres", "error"); return; }
    setCreatingUser(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ username: newUsername, email: newEmail, password: newPassword, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setNewUsername(""); setNewEmail(""); setNewPassword(""); setNewRole("user");
        fetchAll();
        toast("Usuario criado com sucesso!");
      } else { toast(data.message, "error"); }
    } catch { toast("Erro ao criar usuario", "error"); } finally { setCreatingUser(false); }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    setDeletingUser(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${deleteUserId}`, { method: "DELETE", headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) { setDeleteUserId(null); fetchAll(); toast("Usuario excluido!"); }
      else { toast(data.message, "error"); }
    } catch { toast("Erro ao excluir", "error"); } finally { setDeletingUser(false); }
  };

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ role }),
      });
      fetchAll();
      toast("Perfil atualizado!");
    } catch { toast("Erro ao atualizar", "error"); }
  };

  const tabs = [
    { id: "overview" as const, label: "Visao Geral", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
    { id: "users" as const, label: "Usuarios", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
    { id: "audit" as const, label: "Auditoria", icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" },
    { id: "settings" as const, label: "Configuracoes", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="bg-gradient-to-r from-[#00a884] via-[#00c9a0] to-[#00d4a7] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-white/80 mt-1">Gerencie usuarios, sistema e configuracoes</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-8">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  tab === t.id
                    ? "bg-[#00a884] text-white shadow-md shadow-[#00a884]/20"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                </svg>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00a884] border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {tab === "overview" && (
                <div className="space-y-6 animate-fade-in">
                  {/* System Health */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Servidor</p>
                      </div>
                      <p className="text-2xl font-bold text-emerald-600">{health?.status === "healthy" ? "Online" : "Offline"}</p>
                      <p className="text-xs text-gray-400 mt-1">Uptime: {health ? formatUptime(health.uptime) : "-"}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Banco de Dados</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{health?.database === "connected" ? "Conectado" : "Desconectado"}</p>
                      <p className="text-xs text-gray-400 mt-1">PostgreSQL</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                          <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Memoria</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-600">{health?.memoryMB || 0} MB</p>
                      <p className="text-xs text-gray-400 mt-1">Uso de heap</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-[#00a884]/10 flex items-center justify-center">
                          <svg className="h-5 w-5 text-[#00a884]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Faturamento</p>
                      </div>
                      <p className="text-2xl font-bold text-[#00a884]">R$ {(stats?.faturamentoMes || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-400 mt-1">Este mes</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { label: "Usuarios", value: stats?.totalUsers || 0, color: "text-purple-600" },
                      { label: "Pacientes", value: stats?.totalPacientes || 0, color: "text-[#00a884]" },
                      { label: "Doutores", value: stats?.totalDoutores || 0, color: "text-blue-600" },
                      { label: "Consultas", value: stats?.totalConsultas || 0, color: "text-amber-600" },
                      { label: "Hoje", value: stats?.consultasHoje || 0, color: "text-emerald-600" },
                      { label: "No Mes", value: stats?.consultasMes || 0, color: "text-pink-600" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center card-hover">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {tab === "users" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Create User Form */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Criar Novo Usuario</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      <input
                        type="text" placeholder="Username" value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all"
                      />
                      <input
                        type="email" placeholder="Email (opcional)" value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all"
                      />
                      <input
                        type="password" placeholder="Senha (min 8)" value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all"
                      />
                      <select
                        value={newRole} onChange={(e) => setNewRole(e.target.value)}
                        className="px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all"
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={handleCreateUser} disabled={creatingUser}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#00a884] to-[#00c9a0] hover:from-[#009a78] hover:to-[#00b894] rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#00a884]/20"
                      >
                        {creatingUser ? "Criando..." : "Criar Usuario"}
                      </button>
                    </div>
                  </div>

                  {/* Users List */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">Usuarios Cadastrados ({users.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {users.map((u) => (
                        <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                              u.role === "admin" ? "bg-gradient-to-br from-purple-500 to-purple-400" : "bg-gradient-to-br from-[#00a884] to-[#00d4a7]"
                            }`}>
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{u.username}</p>
                              <p className="text-xs text-gray-500">{u.email || "Sem email"} - Criado em {new Date(u.createdAt).toLocaleDateString("pt-BR")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              className="px-2 py-1 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#00a884] outline-none"
                            >
                              <option value="user">Usuario</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => setDeleteUserId(u.id)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Audit Tab */}
              {tab === "audit" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Log de Atividades</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Ultimas acoes registradas no sistema</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {audit.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">Nenhuma atividade registrada</div>
                    ) : (
                      audit.map((entry, i) => (
                        <div key={i} className="p-4 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            entry.tipo === "Usuario" ? "bg-purple-50 text-purple-600" :
                            entry.tipo === "Paciente" ? "bg-[#00a884]/10 text-[#00a884]" :
                            entry.tipo === "Doutor" ? "bg-blue-50 text-blue-600" :
                            "bg-amber-50 text-amber-600"
                          }`}>
                            {entry.tipo.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              <span className="text-gray-500">{entry.tipo}:</span> {entry.acao}
                            </p>
                            <p className="text-xs text-gray-400">{new Date(entry.data).toLocaleString("pt-BR")}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {tab === "settings" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Informacoes da Empresa</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Clinica</label>
                        <input type="text" placeholder="Nome da clinica" className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contato</label>
                        <input type="email" placeholder="contato@clinica.com" className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <input type="text" placeholder="(00) 0000-0000" className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereco</label>
                        <input type="text" placeholder="Rua, numero - Cidade, UF" className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all" />
                      </div>
                    </div>
                    <button className="mt-4 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#00a884] to-[#00c9a0] hover:from-[#009a78] hover:to-[#00b894] rounded-xl transition-all cursor-pointer shadow-lg shadow-[#00a884]/20">
                      Salvar Configuracoes
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Seguranca</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Rate Limiting</p>
                          <p className="text-xs text-gray-500">Bloqueia apos 10 tentativas de login em 15 min</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">ATIVO</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Helmet (HTTP Headers)</p>
                          <p className="text-xs text-gray-500">Protecao contra ataques comuns via headers</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">ATIVO</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Sanitizacao de Input</p>
                          <p className="text-xs text-gray-500">Remove script tags e trimming de inputs</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">ATIVO</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">JWT Autenticacao</p>
                          <p className="text-xs text-gray-500">Tokens com expiracao de 7 dias</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">ATIVO</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">CORS</p>
                          <p className="text-xs text-gray-500">Controle de acessos cross-origin</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">ATIVO</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Role-Based Access</p>
                          <p className="text-xs text-gray-500">Controle de acesso por papel (admin/user)</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">ATIVO</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        title="Excluir Usuario"
        message="Tem certeza que deseja excluir este usuario? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
        loading={deletingUser}
      />
    </>
  );
}
