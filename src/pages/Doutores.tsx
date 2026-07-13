import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import NavBar from "#components/NavBar";
import FormModal from "../components/FormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";

interface Doutor {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  crm?: string;
  especialidade?: string;
  createdAt: string;
}

const API_BASE = "/api";
const itensPorPagina = 5;

const campos = [
  { name: "nome", label: "Nome", required: true, placeholder: "Dr(a). Nome completo" },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "email@exemplo.com" },
  { name: "telefone", label: "Telefone", placeholder: "(11) 99999-0000" },
  { name: "cpf", label: "CPF", placeholder: "000.000.000-00" },
  { name: "crm", label: "CRM", placeholder: "CRM-00000" },
  { name: "especialidade", label: "Especialidade", placeholder: "Ex: Odontologia Geral" },
];

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function DoutoresPage() {
  const [doutores, setDoutores] = useState<Doutor[]>([]);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchDoutores = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(`${API_BASE}/doutores`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setDoutores(data.data);
      } else {
        setErro(data.message);
      }
    } catch {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDoutores(); }, [fetchDoutores]);

  const filtrados = doutores.filter((d) =>
    d.nome.toLowerCase().includes(busca.toLowerCase()) ||
    d.email.toLowerCase().includes(busca.toLowerCase())
  );

  const totalPaginas = Math.ceil(filtrados.length / itensPorPagina);
  const inicio = (pagina - 1) * itensPorPagina;
  const dadosPagina = filtrados.slice(inicio, inicio + itensPorPagina);

  const handleFormChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/doutores`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(formValues),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setFormValues({});
        fetchDoutores();
        toast("Doutor cadastrado com sucesso!");
      } else {
        toast(data.message, "error");
      }
    } catch {
      toast("Erro ao salvar doutor", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/doutores/${deleteId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      setDeleteId(null);
      fetchDoutores();
      toast("Doutor excluido com sucesso!");
    } catch {
      toast("Erro ao excluir doutor", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00a884] via-[#00c9a0] to-[#00d4a7] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Doutores</h1>
            <p className="text-white/80 mt-1">Gerencie os doutores cadastrados</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
              <p className="text-sm font-medium text-gray-500">Total de Doutores</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{doutores.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
              <p className="text-sm font-medium text-gray-500">Especialidades</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {new Set(doutores.map((d) => d.especialidade).filter(Boolean)).size}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
              <p className="text-sm font-medium text-gray-500">Cadastrados Hoje</p>
              <p className="text-3xl font-bold text-[#00a884] mt-1">
                {doutores.filter((d) => new Date(d.createdAt).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] outline-none transition-colors placeholder:text-gray-400"
              />
            </div>
            <Button variant="default" className="bg-[#00a884] hover:bg-[#00a884]/90 text-white" onClick={() => { setFormValues({}); setModalOpen(true); }}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Novo Doutor
            </Button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#00a884] border-t-transparent"></div>
              <p className="text-sm text-gray-500 mt-3">Carregando...</p>
            </div>
          ) : erro ? (
            <div className="p-12 text-center text-red-500 text-sm">{erro}</div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                      <TableHead className="w-16 text-gray-500 font-semibold">ID</TableHead>
                      <TableHead className="text-gray-500 font-semibold">Nome</TableHead>
                      <TableHead className="text-gray-500 font-semibold">Especialidade</TableHead>
                      <TableHead className="text-gray-500 font-semibold">CRM</TableHead>
                      <TableHead className="text-right text-gray-500 font-semibold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosPagina.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-gray-400">
                          Nenhum doutor encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      dadosPagina.map((d) => (
                        <TableRow key={d.id} className="group">
                          <TableCell className="font-mono text-xs text-gray-400">#{d.id.slice(-6)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                                {d.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">{d.nome}</span>
                                <p className="text-xs text-gray-400">{d.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#00a884]/10 text-[#00a884]">
                              {d.especialidade || "-"}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-500 font-mono text-xs">{d.crm || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon-xs" className="text-gray-400 hover:text-red-500" onClick={() => setDeleteId(d.id)}>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden divide-y divide-gray-100">
                {dadosPagina.map((d) => (
                  <div key={d.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                          {d.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{d.nome}</p>
                          <p className="text-sm text-gray-500">{d.especialidade}</p>
                          {d.crm && <p className="text-xs text-gray-400">{d.crm}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && !erro && (
            <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
              <p className="text-sm text-gray-500">
                Mostrando <span className="font-medium text-gray-700">{filtrados.length > 0 ? inicio + 1 : 0}</span> a{" "}
                <span className="font-medium text-gray-700">{Math.min(inicio + itensPorPagina, filtrados.length)}</span> de{" "}
                <span className="font-medium text-gray-700">{filtrados.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)} className="border-gray-200">
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                    <Button key={p} variant={p === pagina ? "default" : "ghost"} size="sm" onClick={() => setPagina(p)}
                      className={p === pagina ? "bg-[#00a884] hover:bg-[#00a884]/90 text-white" : "text-gray-600"}>
                      {p}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" size="sm" disabled={pagina === totalPaginas || totalPaginas === 0} onClick={() => setPagina(pagina + 1)} className="border-gray-200">
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Doutor"
        fields={campos}
        values={formValues}
        onChange={handleFormChange}
        onSubmit={handleCreate}
        loading={saving}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Doutor"
        message="Tem certeza que deseja excluir este doutor? Todas as consultas asociadas serao removidas."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}
