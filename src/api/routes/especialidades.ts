import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

// Listar todas as especialidades
router.get("/especialidades", async (_req, res) => {
  try {
    const especialidades = await prisma.especialidade.findMany({
      orderBy: { nome: "asc" },
      include: { _count: { select: { doutores: true } } },
    });
    res.status(200).json({ success: true, data: especialidades });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao buscar especialidades." });
  }
});

// Criar especialidade
router.post("/especialidades", async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    if (!nome) {
      res.status(400).json({ success: false, message: "Nome e obrigatorio." });
      return;
    }
    const existing = await prisma.especialidade.findUnique({ where: { nome } });
    if (existing) {
      res.status(409).json({ success: false, message: "Especialidade ja existe." });
      return;
    }
    const esp = await prisma.especialidade.create({ data: { nome, descricao } });
    res.status(201).json({ success: true, message: "Especialidade criada.", data: esp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao criar especialidade." });
  }
});

// Atualizar especialidade
router.put("/especialidades/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    const esp = await prisma.especialidade.update({
      where: { id },
      data: { nome, descricao },
    });
    res.status(200).json({ success: true, message: "Especialidade atualizada.", data: esp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao atualizar especialidade." });
  }
});

// Deletar especialidade
router.delete("/especialidades/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.especialidade.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Especialidade removida." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao remover especialidade." });
  }
});

// Buscar horarios livres
router.get("/horarios-livres", async (req, res) => {
  try {
    const { doutorId, especialidadeId, dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      res.status(400).json({ success: false, message: "Data inicio e data fim sao obrigatorios." });
      return;
    }

    const inicio = new Date(dataInicio as string);
    const fim = new Date(dataFim as string);

    // Build filter for doutores
    const doutorFilter: Record<string, unknown> = {};
    if (doutorId) {
      doutorFilter.id = doutorId as string;
    } else if (especialidadeId) {
      doutorFilter.especialidadeId = especialidadeId as string;
    }

    const doutores = await prisma.doutor.findMany({
      where: doutorFilter,
      select: { id: true, nome: true, especialidade: { select: { nome: true } } },
    });

    if (doutores.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const doutorIds = doutores.map((d) => d.id);

    // Get existing consultations in the date range
    const consultasExistentes = await prisma.consulta.findMany({
      where: {
        doutorId: { in: doutorIds },
        data: { gte: inicio, lte: fim },
        status: { not: "cancelada" },
      },
      select: { doutorId: true, data: true, horario: true },
    });

    // Build available slots
    const HORARIOS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];

    const resultado = doutores.map((doutor) => {
      const consultasDoDoutor = consultasExistentes.filter((c) => c.doutorId === doutor.id);
      const horariosOcupados = new Set(consultasDoDoutor.map((c) => `${c.data.toISOString().split("T")[0]}-${c.horario}`));

      const livres: { data: string; horario: string }[] = [];
      const current = new Date(inicio);
      while (current <= fim) {
        if (current.getDay() !== 0) { // Skip Sundays
          const dateStr = current.toISOString().split("T")[0];
          for (const horario of HORARIOS) {
            if (!horariosOcupados.has(`${dateStr}-${horario}`)) {
              livres.push({ data: dateStr, horario });
            }
          }
        }
        current.setDate(current.getDate() + 1);
      }

      return {
        doutorId: doutor.id,
        doutorNome: doutor.nome,
        especialidade: doutor.especialidade?.nome || null,
        horariosLivres: livres,
      };
    });

    res.status(200).json({ success: true, data: resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao buscar horarios livres." });
  }
});

export default router;
