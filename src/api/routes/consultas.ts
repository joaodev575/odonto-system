import express from "express";
import prisma from "../lib/prisma";
import { validateStatus, validateHorario, validateDate, validateMaxLen } from "../middleware/security";

const router = express.Router();

const ANAMNESE_FIELDS = [
  "queixaPrincipal", "historiaDoenca", "alergias", "medicamentos",
  "cirurgias", "historicoFamiliar", "observacoes",
];

// Listar todas as consultas
router.get("/consultas", async (req, res) => {
  try {
    const { especialidadeId, doutorId, status, dataInicio, dataFim } = req.query;
    const where: Record<string, unknown> = {};

    if (especialidadeId) {
      where.doutor = { especialidadeId: especialidadeId as string };
    }
    if (doutorId) {
      where.doutorId = doutorId as string;
    }
    if (status) {
      where.status = status as string;
    }
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) (where.data as Record<string, unknown>).gte = new Date(dataInicio as string);
      if (dataFim) (where.data as Record<string, unknown>).lte = new Date(dataFim as string);
    }

    const consultas = await prisma.consulta.findMany({
      where,
      include: {
        paciente: { select: { id: true, nome: true, email: true, cpf: true, telefone: true } },
        doutor: {
          select: {
            id: true, nome: true, codigoConselho: true,
            especialidade: { select: { id: true, nome: true } },
          },
        },
      },
      orderBy: { data: "desc" },
    });
    res.status(200).json({ success: true, data: consultas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao buscar consultas." });
  }
});

// Buscar consulta por ID
router.get("/consultas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const consulta = await prisma.consulta.findUnique({
      where: { id },
      include: {
        paciente: { select: { id: true, nome: true, email: true, telefone: true, cpf: true, necessidadesEspeciais: true } },
        doutor: {
          select: {
            id: true, nome: true, codigoConselho: true, cpf: true,
            especialidade: { select: { id: true, nome: true } },
          },
        },
      },
    });
    if (!consulta) {
      res.status(404).json({ success: false, message: "Consulta nao encontrada." });
      return;
    }
    res.status(200).json({ success: true, data: consulta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao buscar consulta." });
  }
});

// Criar nova consulta
router.post("/consultas", async (req, res) => {
  try {
    const { pacienteId, doutorId, data, horario, status, descricao, valor, ...anamnese } = req.body;

    if (!pacienteId || !doutorId || !data || !horario) {
      res.status(400).json({ success: false, message: "Paciente, doutor, data e horario sao obrigatorios." });
      return;
    }

    if (typeof pacienteId !== "string" || typeof doutorId !== "string") {
      res.status(400).json({ success: false, message: "IDs invalidos." });
      return;
    }

    if (!validateDate(data)) {
      res.status(400).json({ success: false, message: "Data invalida." });
      return;
    }

    if (!validateHorario(horario)) {
      res.status(400).json({ success: false, message: "Horario invalido. Use formato HH:MM (ex: 09:00)." });
      return;
    }

    if (status && !validateStatus(status)) {
      res.status(400).json({ success: false, message: "Status invalido. Valores: agendada, concluida, cancelada, em_andamento." });
      return;
    }

    if (descricao) {
      const err = validateMaxLen(descricao, 500, "Descricao");
      if (err) { res.status(400).json({ success: false, message: err }); return; }
    }

    const [pacienteExists, doutorExists] = await Promise.all([
      prisma.paciente.findUnique({ where: { id: pacienteId }, select: { id: true } }),
      prisma.doutor.findUnique({ where: { id: doutorId }, select: { id: true } }),
    ]);

    if (!pacienteExists) {
      res.status(400).json({ success: false, message: "Paciente nao encontrado." });
      return;
    }
    if (!doutorExists) {
      res.status(400).json({ success: false, message: "Doutor nao encontrado." });
      return;
    }

    const anamneseData: Record<string, string | null> = {};
    for (const field of ANAMNESE_FIELDS) {
      if (anamnese[field] !== undefined) {
        anamneseData[field] = anamnese[field] || null;
      }
    }

    const consulta = await prisma.consulta.create({
      data: {
        pacienteId,
        doutorId,
        data: new Date(data),
        horario,
        status: status || "agendada",
        descricao: descricao || null,
        valor: valor !== undefined && valor !== null ? parseFloat(valor) : null,
        ...anamneseData,
      },
      include: {
        paciente: { select: { id: true, nome: true } },
        doutor: { select: { id: true, nome: true } },
      },
    });

    res.status(201).json({ success: true, message: "Consulta criada com sucesso.", data: consulta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao criar consulta." });
  }
});

// Atualizar consulta
router.put("/consultas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { pacienteId, doutorId, data, horario, status, descricao, valor, ...anamnese } = req.body;

    const existing = await prisma.consulta.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Consulta nao encontrada." });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (pacienteId) {
      if (typeof pacienteId !== "string") { res.status(400).json({ success: false, message: "ID do paciente invalido." }); return; }
      const exists = await prisma.paciente.findUnique({ where: { id: pacienteId }, select: { id: true } });
      if (!exists) { res.status(400).json({ success: false, message: "Paciente nao encontrado." }); return; }
      updateData.pacienteId = pacienteId;
    }
    if (doutorId) {
      if (typeof doutorId !== "string") { res.status(400).json({ success: false, message: "ID do doutor invalido." }); return; }
      const exists = await prisma.doutor.findUnique({ where: { id: doutorId }, select: { id: true } });
      if (!exists) { res.status(400).json({ success: false, message: "Doutor nao encontrado." }); return; }
      updateData.doutorId = doutorId;
    }
    if (data) {
      if (!validateDate(data)) { res.status(400).json({ success: false, message: "Data invalida." }); return; }
      updateData.data = new Date(data);
    }
    if (horario) {
      if (!validateHorario(horario)) { res.status(400).json({ success: false, message: "Horario invalido." }); return; }
      updateData.horario = horario;
    }
    if (status) {
      if (!validateStatus(status)) { res.status(400).json({ success: false, message: "Status invalido." }); return; }
      updateData.status = status;
    }
    if (descricao !== undefined) {
      if (descricao) {
        const err = validateMaxLen(descricao, 500, "Descricao");
        if (err) { res.status(400).json({ success: false, message: err }); return; }
      }
      updateData.descricao = descricao || null;
    }
    if (valor !== undefined) {
      updateData.valor = valor !== null && valor !== undefined ? parseFloat(valor) : null;
    }

    // Anamnese fields
    for (const field of ANAMNESE_FIELDS) {
      if (anamnese[field] !== undefined) {
        updateData[field] = anamnese[field] || null;
      }
    }

    const consulta = await prisma.consulta.update({
      where: { id },
      data: updateData,
      include: {
        paciente: { select: { id: true, nome: true } },
        doutor: { select: { id: true, nome: true } },
      },
    });

    res.status(200).json({ success: true, message: "Consulta atualizada com sucesso.", data: consulta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao atualizar consulta." });
  }
});

// Deletar consulta
router.delete("/consultas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.consulta.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Consulta nao encontrada." });
      return;
    }
    await prisma.consulta.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Consulta removida com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao remover consulta." });
  }
});

// Dashboard stats
router.get("/dashboard/stats", async (_req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [totalPacientes, totalDoutores, totalConsultas, consultasHoje, consultasMes] =
      await Promise.all([
        prisma.paciente.count(),
        prisma.doutor.count(),
        prisma.consulta.count(),
        prisma.consulta.count({ where: { data: { gte: startOfDay, lt: endOfDay } } }),
        prisma.consulta.count({ where: { data: { gte: startOfMonth, lt: endOfMonth } } }),
      ]);

    res.status(200).json({
      success: true,
      data: { totalPacientes, totalDoutores, totalConsultas, consultasHoje, consultasMes },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao buscar estatisticas." });
  }
});

export default router;
