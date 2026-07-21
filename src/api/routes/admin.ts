import express from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { adminAuth, adminOnly } from "../middleware/admin";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(adminAuth);
router.use(adminOnly);

// System stats
router.get("/admin/stats", async (_req, res) => {
  try {
    const now = new Date();
    const [
      totalUsers,
      totalPacientes,
      totalDoutores,
      totalConsultas,
      consultasHoje,
      consultasMes,
      usuariosAtivos,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.paciente.count(),
      prisma.doutor.count(),
      prisma.consulta.count(),
      prisma.consulta.count({
        where: {
          data: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
      }),
      prisma.consulta.count({
        where: {
          data: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        },
      }),
      prisma.user.count({ where: { role: "user" } }),
    ]);

    // Faturamento do mes
    const faturamento = await prisma.consulta.aggregate({
      where: {
        status: "concluida",
        data: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
      },
      _sum: { valor: true },
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPacientes,
        totalDoutores,
        totalConsultas,
        consultasHoje,
        consultasMes,
        usuariosAtivos,
        faturamentoMes: faturamento._sum.valor || 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao buscar estatisticas." });
  }
});

// List all users
router.get("/admin/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao buscar usuarios." });
  }
});

// Create user
router.post("/admin/users", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: "Username e senha sao obrigatorios." });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: "Senha deve ter pelo menos 8 caracteres." });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      res.status(409).json({ success: false, message: "Username ja existe." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || "user",
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, message: "Usuario criado com sucesso.", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao criar usuario." });
  }
});

// Update user role
router.put("/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role, email } = req.body;

    // Prevent admin from changing their own role
    const currentUser = (req as any).user;
    if (currentUser.id === id && role && role !== currentUser.role) {
      res.status(400).json({ success: false, message: "Nao e possivel alterar seu proprio perfil." });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (role) updateData.role = role;
    if (email !== undefined) updateData.email = email;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json({ success: true, message: "Usuario atualizado.", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao atualizar usuario." });
  }
});

// Delete user
router.delete("/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    const currentUser = (req as any).user;
    if (currentUser.id === id) {
      res.status(400).json({ success: false, message: "Nao e possivel excluir seu proprio usuario." });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Usuario excluido." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao excluir usuario." });
  }
});

// System health check
router.get("/admin/health", async (_req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      data: {
        status: "healthy",
        database: "connected",
        uptime: Math.floor(process.uptime()),
        memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      data: { status: "unhealthy", database: "disconnected" },
    });
  }
});

// Audit log (last 50 actions)
router.get("/admin/audit", async (_req, res) => {
  try {
    // Get recent creates/updates across all tables
    const [recentPacientes, recentDoutores, recentConsultas, recentUsers] = await Promise.all([
      prisma.paciente.findMany({
        select: { id: true, nome: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.doutor.findMany({
        select: { id: true, nome: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.consulta.findMany({
        select: { id: true, pacienteId: true, doutorId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.user.findMany({
        select: { id: true, username: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const audit = [
      ...recentPacientes.map((p) => ({ tipo: "Paciente", acao: p.nome, data: p.createdAt })),
      ...recentDoutores.map((d) => ({ tipo: "Doutor", acao: d.nome, data: d.createdAt })),
      ...recentConsultas.map((c) => ({ tipo: "Consulta", acao: `${c.pacienteId} / ${c.doutorId}`, data: c.createdAt })),
      ...recentUsers.map((u) => ({ tipo: "Usuario", acao: u.username, data: u.createdAt })),
    ]
      .sort((a, b) => b.data.getTime() - a.data.getTime())
      .slice(0, 50);

    res.status(200).json({ success: true, data: audit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao buscar auditoria." });
  }
});

export default router;
