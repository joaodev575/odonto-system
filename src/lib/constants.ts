export const STATUS_COLORS: Record<string, string> = {
  agendada: "bg-blue-50 text-blue-700 border border-blue-200/60",
  concluida: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  cancelada: "bg-red-50 text-red-700 border border-red-200/60",
  em_andamento: "bg-amber-50 text-amber-700 border border-amber-200/60",
};

export const STATUS_DOT_COLORS: Record<string, string> = {
  agendada: "bg-blue-500",
  concluida: "bg-emerald-500",
  cancelada: "bg-red-500",
  em_andamento: "bg-amber-500",
};

export const STATUS_LABELS: Record<string, string> = {
  agendada: "Agendada",
  concluida: "Concluida",
  cancelada: "Cancelada",
  em_andamento: "Em Andamento",
};

export const VALID_STATUSES = ["agendada", "concluida", "cancelada", "em_andamento"];
export const VALID_ROLES = ["user", "admin"];
export const VALID_STATUS_OPTIONS = [
  { value: "agendada", label: "Agendada" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluida", label: "Concluida" },
  { value: "cancelada", label: "Cancelada" },
];

export const HORARIOS = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00",
];
