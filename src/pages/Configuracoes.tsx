import { useState, useEffect, useCallback } from "react";
import NavBar from "#components/NavBar";
import FormModal from "../components/FormModal";
import { useToast } from "../components/Toast";

interface Stats {
  totalPacientes: number;
  totalDoutores: number;
  totalConsultas: number;
  consultasHoje: number;
  consultasMes: number;
}

interface Paciente { id: string; nome: string; }
interface Doutor { id: string; nome: string; especialidade?: string; }
interface Consulta {
  id: string; data: string; horario: string; status: string; valor?: number;
  paciente: { nome: string }; doutor: { nome: string };
}

const API_BASE = "/api";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ConfiguracoesPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [doutores, setDoutores] = useState<Doutor[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [consultaModal, setConsultaModal] = useState(false);
  const [doutorModal, setDoutorModal] = useState(false);
  const [pacienteModal, setPacienteModal] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [sRes, cRes, pRes, dRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats`, { headers }),
        fetch(`${API_BASE}/consultas`, { headers }),
        fetch(`${API_BASE}/pacientes`, { headers }),
        fetch(`${API_BASE}/doutores`, { headers }),
      ]);
      const [sData, cData, pData, dData] = await Promise.all([sRes.json(), cRes.json(), pRes.json(), dRes.json()]);
      if (sData.success) setStats(sData.data);
      if (cData.success) setConsultas(cData.data);
      if (pData.success) setPacientes(pData.data);
      if (dData.success) setDoutores(dData.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFormChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Create Consulta
  const handleCreateConsulta = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/consultas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(formValues),
      });
      const data = await res.json();
      if (data.success) {
        setConsultaModal(false);
        setFormValues({});
        fetchData();
        toast("Consulta agendada com sucesso!");
      } else { toast(data.message, "error"); }
    } catch { toast("Erro ao salvar", "error"); } finally { setSaving(false); }
  };

  // Create Doutor
  const handleCreateDoutor = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/doutores`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(formValues),
      });
      const data = await res.json();
      if (data.success) {
        setDoutorModal(false);
        setFormValues({});
        fetchData();
        toast("Doutor cadastrado com sucesso!");
      } else { toast(data.message, "error"); }
    } catch { toast("Erro ao salvar", "error"); } finally { setSaving(false); }
  };

  // Create Paciente
  const handleCreatePaciente = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/pacientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(formValues),
      });
      const data = await res.json();
      if (data.success) {
        setPacienteModal(false);
        setFormValues({});
        fetchData();
        toast("Paciente cadastrado com sucesso!");
      } else { toast(data.message, "error"); }
    } catch { toast("Erro ao salvar", "error"); } finally { setSaving(false); }
  };

  const consultaCampos = [
    { name: "pacienteId", label: "Paciente", required: true, options: pacientes.map((p) => ({ value: p.id, label: p.nome })) },
    { name: "doutorId", label: "Doutor", required: true, options: doutores.map((d) => ({ value: d.id, label: d.nome })) },
    { name: "data", label: "Data", type: "date", required: true },
    { name: "horario", label: "Horario", required: true, placeholder: "09:00" },
    { name: "status", label: "Status", options: [
      { value: "agendada", label: "Agendada" }, { value: "em_andamento", label: "Em Andamento" },
      { value: "concluida", label: "Concluida" }, { value: "cancelada", label: "Cancelada" },
    ]},
    { name: "descricao", label: "Descricao", placeholder: "Descricao da consulta" },
    { name: "valor", label: "Valor (R$)", type: "number", placeholder: "0.00" },
  ];

  const doutorCampos = [
    { name: "nome", label: "Nome", required: true, placeholder: "Dr(a). Nome completo" },
    { name: "email", label: "Email", type: "email", required: true, placeholder: "email@exemplo.com" },
    { name: "telefone", label: "Telefone", placeholder: "(11) 99999-0000" },
    { name: "cpf", label: "CPF", placeholder: "000.000.000-00" },
    { name: "crm", label: "CRM", placeholder: "CRM-00000" },
    { name: "especialidade", label: "Especialidade", placeholder: "Ex: Odontologia Geral" },
  ];

  const pacienteCampos = [
    { name: "nome", label: "Nome", required: true, placeholder: "Nome completo" },
    { name: "email", label: "Email", type: "email", required: true, placeholder: "email@exemplo.com" },
    { name: "telefone", label: "Telefone", placeholder: "(11) 99999-0000" },
    { name: "cpf", label: "CPF", placeholder: "000.000.000-00" },
    { name: "endereco", label: "Endereco", placeholder: "Rua, numero - Cidade, UF" },
    { name: "dataNascimento", label: "Data de Nascimento", type: "date" },
  ];

  const consultasMes = consultas.filter((c) => {
    const d = new Date(c.data);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const faturamentoMes = consultasMes
    .filter((c) => c.status === "concluida")
    .reduce((acc, c) => acc + (c.valor || 0), 0);

  const consultasByStatus = {
    agendada: consultasMes.filter((c) => c.status === "agendada").length,
    concluida: consultasMes.filter((c) => c.status === "concluida").length,
    cancelada: consultasMes.filter((c) => c.status === "cancelada").length,
    em_andamento: consultasMes.filter((c) => c.status === "em_andamento").length,
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00a884] via-[#00c9a0] to-[#00d4a7] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Configuracoes</h1>
            <p className="text-white/80 mt-1">Gerencie todo o sistema em um so lugar</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00a884] border-t-transparent"></div>
                <p className="text-sm text-gray-500">Carregando...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => { setFormValues({ status: "agendada" }); setConsultaModal(true); }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm card-hover text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#00a884] to-[#00d4a7] flex items-center justify-center shadow-lg shadow-[#00a884]/20 group-hover:scale-105 transition-transform">
                      <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Agendar Consulta</p>
                      <p className="text-sm text-gray-500 mt-0.5">Criar nova consulta</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setFormValues({}); setDoutorModal(true); }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm card-hover text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                      <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Cadastrar Doutor</p>
                      <p className="text-sm text-gray-500 mt-0.5">Adicionar novo doutor</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setFormValues({}); setPacienteModal(true); }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm card-hover text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                      <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Cadastrar Paciente</p>
                      <p className="text-sm text-gray-500 mt-0.5">Adicionar novo paciente</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Resumo do Mes */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Resumo do Mes</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                  </p>
                </div>

                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[#00a884]/5 border border-[#00a884]/10">
                    <p className="text-sm font-medium text-gray-500">Total de Consultas</p>
                    <p className="text-2xl font-bold text-[#00a884] mt-1">{consultasMes.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-sm font-medium text-gray-500">Agendadas</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{consultasByStatus.agendada}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-sm font-medium text-gray-500">Concluidas</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{consultasByStatus.concluida}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-sm font-medium text-gray-500">Faturamento</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">R$ {faturamentoMes.toFixed(2)}</p>
                  </div>
                </div>

                {/* Status breakdown bar */}
                {consultasMes.length > 0 && (
                  <div className="px-5 pb-5">
                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex">
                      {consultasByStatus.agendada > 0 && (
                        <div
                          className="bg-blue-500 transition-all duration-500"
                          style={{ width: `${(consultasByStatus.agendada / consultasMes.length) * 100}%` }}
                        />
                      )}
                      {consultasByStatus.concluida > 0 && (
                        <div
                          className="bg-emerald-500 transition-all duration-500"
                          style={{ width: `${(consultasByStatus.concluida / consultasMes.length) * 100}%` }}
                        />
                      )}
                      {consultasByStatus.em_andamento > 0 && (
                        <div
                          className="bg-amber-500 transition-all duration-500"
                          style={{ width: `${(consultasByStatus.em_andamento / consultasMes.length) * 100}%` }}
                        />
                      )}
                      {consultasByStatus.cancelada > 0 && (
                        <div
                          className="bg-red-500 transition-all duration-500"
                          style={{ width: `${(consultasByStatus.cancelada / consultasMes.length) * 100}%` }}
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-gray-500">Agendadas ({consultasByStatus.agendada})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-gray-500">Concluidas ({consultasByStatus.concluida})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-gray-500">Em Andamento ({consultasByStatus.em_andamento})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                        <span className="text-xs text-gray-500">Canceladas ({consultasByStatus.cancelada})</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Doutores Cadastrados */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Doutores Cadastrados</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{doutores.length} doutores no sistema</p>
                  </div>
                  <button
                    onClick={() => { setFormValues({}); setDoutorModal(true); }}
                    className="text-sm font-medium text-[#00a884] hover:bg-[#00a884]/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    + Adicionar
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {doutores.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Nenhum doutor cadastrado</div>
                  ) : (
                    doutores.map((d) => (
                      <div key={d.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {d.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{d.nome}</p>
                            <p className="text-xs text-gray-500">{d.especialidade || "Geral"}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* System Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Informacoes do Sistema</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="h-10 w-10 rounded-xl bg-[#00a884]/10 flex items-center justify-center">
                      <svg className="h-5 w-5 text-[#00a884]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Versao</p>
                      <p className="text-sm font-semibold text-gray-900">1.0.0</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Banco de Dados</p>
                      <p className="text-sm font-semibold text-gray-900">PostgreSQL</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-semibold text-emerald-600">Online</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <FormModal
        isOpen={consultaModal}
        onClose={() => setConsultaModal(false)}
        title="Agendar Consulta"
        fields={consultaCampos}
        values={formValues}
        onChange={handleFormChange}
        onSubmit={handleCreateConsulta}
        loading={saving}
      />
      <FormModal
        isOpen={doutorModal}
        onClose={() => setDoutorModal(false)}
        title="Cadastrar Doutor"
        fields={doutorCampos}
        values={formValues}
        onChange={handleFormChange}
        onSubmit={handleCreateDoutor}
        loading={saving}
      />
      <FormModal
        isOpen={pacienteModal}
        onClose={() => setPacienteModal(false)}
        title="Cadastrar Paciente"
        fields={pacienteCampos}
        values={formValues}
        onChange={handleFormChange}
        onSubmit={handleCreatePaciente}
        loading={saving}
      />
    </>
  );
}
