import { useState, useEffect, useCallback } from "react";
import NavBar from "#components/NavBar";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";

interface AdminStats {
  totalUsers: number; totalPacientes: number; totalDoutores: number;
  totalConsultas: number; consultasHoje: number; consultasMes: number;
  usuariosAtivos: number; faturamentoMes: number;
}

interface User {
  id: string; username: string; email?: string; role: string;
  createdAt: string; updatedAt: string;
}

interface AuditEntry {
  tipo: string; acao: string; data: string;
}

interface Especialidade {
  id: string; nome: string; descricao?: string;
  _count?: { doutores: number };
}

const API_BASE = "/api";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "audit" | "especialidades">("overview");

  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [creatingUser, setCreatingUser] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const [newEspecialidade, setNewEspecialidade] = useState("");
  const [newEspecialidadeDesc, setNewEspecialidadeDesc] = useState("");
  const [creatingEspecialidade, setCreatingEspecialidade] = useState(false);
  const [deleteEspecialidadeId, setDeleteEspecialidadeId] = useState<string | null>(null);
  const [deletingEspecialidade, setDeletingEspecialidade] = useState(false);

  const { toast } = useToast();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [sRes, uRes, aRes, eRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`, { headers }),
        fetch(`${API_BASE}/admin/users`, { headers }),
        fetch(`${API_BASE}/admin/audit`, { headers }),
        fetch(`${API_BASE}/especialidades`, { headers }),
      ]);
      const [sData, uData, aData, eData] = await Promise.all([sRes.json(), uRes.json(), aRes.json(), eRes.json()]);
      if (sData.success) setStats(sData.data);
      if (uData.success) setUsers(uData.data);
      if (aData.success) setAudit(aData.data);
      if (eData.success) setEspecialidades(eData.data);
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
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAll();
        toast("Perfil atualizado!");
      } else {
        toast(data.message, "error");
      }
    } catch { toast("Erro ao atualizar", "error"); }
  };

  const handleCreateEspecialidade = async () => {
    if (!newEspecialidade) { toast("Nome e obrigatorio", "error"); return; }
    setCreatingEspecialidade(true);
    try {
      const res = await fetch(`${API_BASE}/especialidades`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ nome: newEspecialidade, descricao: newEspecialidadeDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setNewEspecialidade(""); setNewEspecialidadeDesc("");
        fetchAll();
        toast("Especialidade criada!");
      } else { toast(data.message, "error"); }
    } catch { toast("Erro ao criar", "error"); } finally { setCreatingEspecialidade(false); }
  };

  const handleDeleteEspecialidade = async () => {
    if (!deleteEspecialidadeId) return;
    setDeletingEspecialidade(true);
    try {
      await fetch(`${API_BASE}/especialidades/${deleteEspecialidadeId}`, { method: "DELETE", headers: getAuthHeaders() });
      setDeleteEspecialidadeId(null);
      fetchAll();
      toast("Especialidade excluida!");
    } catch { toast("Erro ao excluir", "error"); } finally { setDeletingEspecialidade(false); }
  };

  const tabs = [
    { id: "overview" as const, label: "Visao Geral", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
    { id: "users" as const, label: "Usuarios", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
    { id: "audit" as const, label: "Auditoria", icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" },
    { id: "especialidades" as const, label: "Especialidades", icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
  ];

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="bg-gradient-to-r from-[#00a884] via-[#00c9a0] to-[#00d4a7] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-white/80 mt-1">Gerencie usuarios, especialidades e configuracoes</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-8">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                          <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Usuarios</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{stats?.totalUsers || 0}</p>
                      <p className="text-xs text-gray-400 mt-1">{stats?.usuariosAtivos || 0} ativos</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Doutores</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{stats?.totalDoutores || 0}</p>
                      <p className="text-xs text-gray-400 mt-1">Cadastrados</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                          <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Consultas Hoje</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-600">{stats?.consultasHoje || 0}</p>
                      <p className="text-xs text-gray-400 mt-1">{stats?.consultasMes || 0} no mes</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Pacientes", value: stats?.totalPacientes || 0, color: "text-[#00a884]" },
                      { label: "Consultas Total", value: stats?.totalConsultas || 0, color: "text-amber-600" },
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

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">Usuarios Cadastrados ({users.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {users.map((u) => {
                        const isCurrentUser = u.id === currentUser.id;
                        return (
                          <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                                u.role === "admin" ? "bg-gradient-to-br from-purple-500 to-purple-400" : "bg-gradient-to-br from-[#00a884] to-[#00d4a7]"
                              }`}>
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {u.username}
                                  {isCurrentUser && <span className="ml-2 text-xs text-gray-400">(voce)</span>}
                                </p>
                                <p className="text-xs text-gray-500">{u.email || "Sem email"} - Criado em {new Date(u.createdAt).toLocaleDateString("pt-BR")}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={u.role}
                                onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                disabled={isCurrentUser}
                                className="px-2 py-1 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#00a884] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="user">Usuario</option>
                                <option value="admin">Admin</option>
                              </select>
                              {!isCurrentUser && (
                                <button
                                  onClick={() => setDeleteUserId(u.id)}
                                  className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
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

              {/* Especialidades Tab */}
              {tab === "especialidades" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Nova Especialidade</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text" placeholder="Nome da especialidade" value={newEspecialidade}
                        onChange={(e) => setNewEspecialidade(e.target.value)}
                        className="px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all"
                      />
                      <input
                        type="text" placeholder="Descricao (opcional)" value={newEspecialidadeDesc}
                        onChange={(e) => setNewEspecialidadeDesc(e.target.value)}
                        className="px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all"
                      />
                      <button
                        onClick={handleCreateEspecialidade} disabled={creatingEspecialidade}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#00a884] to-[#00c9a0] hover:from-[#009a78] hover:to-[#00b894] rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#00a884]/20"
                      >
                        {creatingEspecialidade ? "Criando..." : "Criar"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">Especialidades ({especialidades.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {especialidades.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Nenhuma especialidade cadastrada</div>
                      ) : (
                        especialidades.map((e) => (
                          <div key={e.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-[#00a884]/10 flex items-center justify-center text-[#00a884] font-bold text-sm">
                                {e.nome.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{e.nome}</p>
                                <p className="text-xs text-gray-500">
                                  {e._count?.doutores || 0} doutor(es) associados
                                  {e.descricao && ` - ${e.descricao}`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setDeleteEspecialidadeId(e.id)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
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
      <ConfirmDialog
        isOpen={!!deleteEspecialidadeId}
        onClose={() => setDeleteEspecialidadeId(null)}
        onConfirm={handleDeleteEspecialidade}
        title="Excluir Especialidade"
        message="Tem certeza que deseja excluir esta especialidade?"
        confirmLabel="Excluir"
        variant="danger"
        loading={deletingEspecialidade}
      />
    </>
  );
}
