import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import NavBar from "#components/NavBar";

interface Stats {
  totalPacientes: number;
  totalDoutores: number;
  totalConsultas: number;
  consultasHoje: number;
  consultasMes: number;
}

interface ConsultaRecente {
  id: string;
  data: string;
  horario: string;
  status: string;
  paciente: { nome: string };
  doutor: { nome: string; especialidade?: string };
}

const API_BASE = "/api";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [consultas, setConsultas] = useState<ConsultaRecente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    const headers = getAuthHeaders();
    Promise.all([
      fetch(`${API_BASE}/dashboard/stats`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/consultas`, { headers }).then((r) => r.json()),
    ])
      .then(([statsData, consultasData]) => {
        if (statsData.success) setStats(statsData.data);
        if (consultasData.success) setConsultas(consultasData.data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const statusColors: Record<string, string> = {
    agendada: "bg-blue-50 text-blue-700 border border-blue-200/60",
    concluida: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    cancelada: "bg-red-50 text-red-700 border border-red-200/60",
    em_andamento: "bg-amber-50 text-amber-700 border border-amber-200/60",
  };

  const statusLabels: Record<string, string> = {
    agendada: "Agendada",
    concluida: "Concluida",
    cancelada: "Cancelada",
    em_andamento: "Em Andamento",
  };

  const statCards = [
    {
      label: "Pacientes",
      value: stats?.totalPacientes ?? 0,
      link: "/pacientes",
      icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
      color: "from-[#00a884] to-[#00d4a7]",
      bgColor: "bg-[#00a884]/10",
      textColor: "text-[#00a884]",
    },
    {
      label: "Doutores",
      value: stats?.totalDoutores ?? 0,
      link: "/doutores",
      icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
      color: "from-blue-500 to-blue-400",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Consultas Hoje",
      value: stats?.consultasHoje ?? 0,
      link: "/consultas",
      icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
      color: "from-amber-500 to-amber-400",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "Consultas no Mes",
      value: stats?.consultasMes ?? 0,
      link: "/consultas",
      icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
      color: "from-emerald-500 to-emerald-400",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00a884] via-[#00c9a0] to-[#00d4a7] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Painel Geral</h1>
                <p className="text-white/80 mt-1">Visao geral do sistema odontologico</p>
              </div>
              <Link to="/configuracoes">
                <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuracoes
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00a884] border-t-transparent"></div>
                <p className="text-sm text-gray-500">Carregando dados...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card) => (
                  <Link
                    key={card.label}
                    to={card.link}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover animate-fade-in block"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{card.label}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                      </div>
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg shadow-${card.textColor}/20`}>
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Consultas Recentes */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Consultas Recentes</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Ultimas consultas agendadas</p>
                  </div>
                  <Link to="/consultas">
                    <Button variant="ghost" size="sm" className="text-[#00a884] hover:bg-[#00a884]/10">
                      Ver todas
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </Button>
                  </Link>
                </div>

                {consultas.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="inline-flex h-16 w-16 rounded-2xl bg-gray-100 items-center justify-center mb-4">
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">Nenhuma consulta registrada</p>
                    <p className="text-sm text-gray-400 mt-1">Comece agendando uma consulta</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {consultas.map((c, i) => (
                      <div
                        key={c.id}
                        className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors animate-fade-in"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#00a884] to-[#00d4a7] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md shadow-[#00a884]/20">
                            {c.paciente.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{c.paciente.nome}</p>
                            <p className="text-sm text-gray-500">
                              {c.doutor.nome}
                              {c.doutor.especialidade && (
                                <span className="text-gray-400"> - {c.doutor.especialidade}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[c.status] || "bg-gray-50 text-gray-700"}`}>
                            {statusLabels[c.status] || c.status}
                          </span>
                          <p className="text-xs text-gray-400 mt-1.5">
                            {new Date(c.data).toLocaleDateString("pt-BR")} as {c.horario}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
