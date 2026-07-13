import { useState, useEffect, useCallback } from "react";
import NavBar from "#components/NavBar";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";

interface Consulta {
  id: string; data: string; horario: string; status: string; descricao?: string; valor?: number;
  paciente: { id: string; nome: string; email: string; telefone?: string };
  doutor: { id: string; nome: string; especialidade?: string; crm?: string };
}
interface Paciente { id: string; nome: string; }
interface Doutor { id: string; nome: string; }

const API_BASE = "/api";
const HORARIOS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];

const statusColors: Record<string, string> = {
  agendada: "bg-blue-500", concluida: "bg-emerald-500", cancelada: "bg-red-500", em_andamento: "bg-amber-500",
};
const statusBg: Record<string, string> = {
  agendada: "bg-blue-50 border-blue-200 text-blue-800",
  concluida: "bg-emerald-50 border-emerald-200 text-emerald-800",
  cancelada: "bg-red-50 border-red-200 text-red-800",
  em_andamento: "bg-amber-50 border-amber-200 text-amber-800",
};

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const MONTHS = ["Janeiro","Fevereiro","Marco","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sab"];

export default function CalendarioPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [doutores, setDoutores] = useState<Doutor[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [filterDoutor, setFilterDoutor] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [cRes, pRes, dRes] = await Promise.all([
        fetch(`${API_BASE}/consultas`, { headers }),
        fetch(`${API_BASE}/pacientes`, { headers }),
        fetch(`${API_BASE}/doutores`, { headers }),
      ]);
      const [cData, pData, dData] = await Promise.all([cRes.json(), pRes.json(), dRes.json()]);
      if (cData.success) setConsultas(cData.data);
      if (pData.success) setPacientes(pData.data);
      if (dData.success) setDoutores(dData.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const consultasDoMes = consultas.filter((c) => {
    const d = new Date(c.data);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const consultasFiltradas = filterDoutor
    ? consultasDoMes.filter((c) => c.doutor.id === filterDoutor)
    : consultasDoMes;

  const consultasPorDia: Record<number, Consulta[]> = {};
  consultasFiltradas.forEach((c) => {
    const day = new Date(c.data).getDate();
    if (!consultasPorDia[day]) consultasPorDia[day] = [];
    consultasPorDia[day].push(c);
  });

  const consultasDoDia = selectedDay ? consultasPorDia[selectedDay] || [] : [];

  const navigateMonth = (dir: number) => {
    let m = currentMonth + dir;
    let y = currentYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCurrentMonth(m);
    setCurrentYear(y);
    setSelectedDay(null);
  };

  const handleFormChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

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
        setModalOpen(false);
        setFormValues({});
        fetchData();
        toast("Consulta agendada com sucesso!");
      } else { toast(data.message, "error"); }
    } catch { toast("Erro ao salvar", "error"); } finally { setSaving(false); }
  };

  const handleDeleteConsulta = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/consultas/${deleteId}`, { method: "DELETE", headers: getAuthHeaders() });
      setSelectedConsulta(null);
      setDeleteId(null);
      fetchData();
      toast("Consulta excluida com sucesso!");
    } catch { toast("Erro ao excluir", "error"); } finally { setDeleting(false); }
  };

  const consultaCampos = [
    { name: "pacienteId", label: "Paciente", required: true, options: pacientes.map((p) => ({ value: p.id, label: p.nome })) },
    { name: "doutorId", label: "Doutor", required: true, options: doutores.map((d) => ({ value: d.id, label: d.nome })) },
    { name: "horario", label: "Horario", required: true, options: HORARIOS.map((h) => ({ value: h, label: h })) },
    { name: "status", label: "Status", options: [
      { value: "agendada", label: "Agendada" }, { value: "em_andamento", label: "Em Andamento" },
      { value: "concluida", label: "Concluida" }, { value: "cancelada", label: "Cancelada" },
    ]},
    { name: "descricao", label: "Descricao", placeholder: "Descricao da consulta" },
    { name: "valor", label: "Valor (R$)", type: "number", placeholder: "0.00" },
  ];

  const today = new Date();

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="bg-gradient-to-r from-[#00a884] via-[#00c9a0] to-[#00d4a7] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Calendario</h1>
                <p className="text-white/80 mt-1">Visualize e gerencie consultas por dia</p>
              </div>
              <button
                onClick={() => {
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay || today.getDate()).padStart(2, "0")}`;
                  setFormValues({ data: dateStr, horario: "09:00", status: "agendada" });
                  setModalOpen(true);
                }}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-medium transition-all cursor-pointer"
              >
                + Nova Consulta
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00a884] border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Grid */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigateMonth(-1)} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                      <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    <h2 className="text-lg font-bold text-gray-900">{MONTHS[currentMonth]} {currentYear}</h2>
                    <button onClick={() => navigateMonth(1)} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                      <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <select
                      value={filterDoutor}
                      onChange={(e) => setFilterDoutor(e.target.value)}
                      className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all"
                    >
                      <option value="">Todos os doutores</option>
                      {doutores.map((d) => (
                        <option key={d.id} value={d.id}>{d.nome}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); setSelectedDay(today.getDate()); }}
                      className="px-3 py-1.5 text-sm font-medium text-[#00a884] hover:bg-[#00a884]/10 rounded-xl transition-colors cursor-pointer"
                    >
                      Hoje
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEKDAYS.map((d) => (
                      <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                    ))}
                  </div>
                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dayConsultas = consultasPorDia[day] || [];
                      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                      const isSelected = day === selectedDay;
                      const hasConsultas = dayConsultas.length > 0;

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "bg-[#00a884] text-white shadow-lg shadow-[#00a884]/30 scale-105"
                              : isToday
                                ? "bg-[#00a884]/10 text-[#00a884] ring-2 ring-[#00a884]/30"
                                : hasConsultas
                                  ? "bg-gray-50 text-gray-900 hover:bg-gray-100"
                                  : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {day}
                          {hasConsultas && !isSelected && (
                            <div className="absolute bottom-1.5 flex gap-0.5">
                              {dayConsultas.slice(0, 3).map((c, idx) => (
                                <div key={idx} className={`h-1.5 w-1.5 rounded-full ${statusColors[c.status] || "bg-gray-400"}`} />
                              ))}
                              {dayConsultas.length > 3 && (
                                <span className="text-[8px] text-gray-400 ml-0.5">+{dayConsultas.length - 3}</span>
                              )}
                            </div>
                          )}
                          {isSelected && hasConsultas && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-[#00a884] text-[10px] font-bold flex items-center justify-center shadow-sm">
                              {dayConsultas.length}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="px-5 pb-5 flex flex-wrap gap-3">
                  {Object.entries(statusColors).map(([key, color]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${color}`}></div>
                      <span className="text-xs text-gray-500 capitalize">{key.replace("_", " ")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel - Day Details */}
              <div className="space-y-4">
                {/* Selected Day Header */}
                {selectedDay && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">
                        {selectedDay} de {MONTHS[currentMonth]}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {consultasDoDia.length} consulta{consultasDoDia.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {consultasDoDia.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="inline-flex h-14 w-14 rounded-2xl bg-gray-100 items-center justify-center mb-3">
                          <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Nenhuma consulta neste dia</p>
                        <p className="text-xs text-gray-400 mt-1">Clique em "+ Nova Consulta" para agendar</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {consultasDoDia
                          .sort((a, b) => a.horario.localeCompare(b.horario))
                          .map((c) => (
                            <button
                              key={c.id}
                              onClick={() => setSelectedConsulta(c)}
                              className={`w-full text-left p-3 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                                selectedConsulta?.id === c.id
                                  ? "border-[#00a884] bg-[#00a884]/5 shadow-md"
                                  : "border-gray-100 hover:border-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-sm font-bold text-[#00a884]">{c.horario}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBg[c.status] || ""}`}>
                                  {c.status.replace("_", " ")}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">{c.paciente.nome}</p>
                              <p className="text-xs text-gray-500">{c.doutor.nome}</p>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Consulta Detail */}
                {selectedConsulta && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">Detalhes da Consulta</h3>
                      <button onClick={() => setSelectedConsulta(null)} className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <div className="h-10 w-10 rounded-xl bg-[#00a884]/10 flex items-center justify-center">
                          <svg className="h-5 w-5 text-[#00a884]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Horario</p>
                          <p className="font-bold text-gray-900">{selectedConsulta.horario}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Paciente</p>
                          <p className="font-bold text-gray-900">{selectedConsulta.paciente.nome}</p>
                          <p className="text-xs text-gray-500">{selectedConsulta.paciente.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                          <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Doutor</p>
                          <p className="font-bold text-gray-900">{selectedConsulta.doutor.nome}</p>
                          <p className="text-xs text-gray-500">{selectedConsulta.doutor.especialidade || "Geral"}</p>
                        </div>
                      </div>
                      {selectedConsulta.valor != null && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Valor</p>
                            <p className="font-bold text-gray-900">R$ {selectedConsulta.valor.toFixed(2)}</p>
                          </div>
                        </div>
                      )}
                      {selectedConsulta.descricao && (
                        <div className="p-3 rounded-xl bg-gray-50">
                          <p className="text-xs text-gray-500 mb-1">Descricao</p>
                          <p className="text-sm text-gray-700">{selectedConsulta.descricao}</p>
                        </div>
                      )}
                      <button
                        onClick={() => setDeleteId(selectedConsulta.id)}
                        className="w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                      >
                        Excluir Consulta
                      </button>
                    </div>
                  </div>
                )}

                {/* Time Slots for selected day */}
                {selectedDay && consultasDoDia.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900 text-sm">Horarios do Dia</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {HORARIOS.map((h) => {
                        const consulta = consultasDoDia.find((c) => c.horario === h);
                        return (
                          <div key={h} className={`px-4 py-2.5 flex items-center gap-3 ${consulta ? "bg-[#00a884]/5" : ""}`}>
                            <span className="font-mono text-xs text-gray-400 w-12">{h}</span>
                            {consulta ? (
                              <div className="flex-1 flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${statusColors[consulta.status]}`}></div>
                                <span className="text-sm font-medium text-gray-900">{consulta.paciente.nome}</span>
                                <span className="text-xs text-gray-500">- {consulta.doutor.nome}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-300 italic">Livre</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova Consulta"
        fields={consultaCampos}
        values={formValues}
        onChange={handleFormChange}
        onSubmit={handleCreateConsulta}
        loading={saving}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConsulta}
        title="Excluir Consulta"
        message="Tem certeza que deseja excluir esta consulta? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}
