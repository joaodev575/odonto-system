import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

// Listar todos os doutores
router.get("/doutores", async (_req, res) => {
  try {
    const doutores = await prisma.doutor.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: doutores,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar doutores.",
    });
  }
});

// Buscar doutor por ID
router.get("/doutores/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const doutor = await prisma.doutor.findUnique({
      where: { id },
    });

    if (!doutor) {
      res.status(404).json({
        success: false,
        message: "Doutor não encontrado.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: doutor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar doutor.",
    });
  }
});

// Criar novo doutor
router.post("/doutores", async (req, res) => {
  try {
    const { nome, email, telefone, cpf, crm, especialidade } = req.body;

    if (!nome || !email) {
      res.status(400).json({
        success: false,
        message: "Nome e email são obrigatórios.",
      });
      return;
    }

    const doutor = await prisma.doutor.create({
      data: {
        nome,
        email,
        telefone,
        cpf,
        crm,
        especialidade,
      },
    });

    res.status(201).json({
      success: true,
      message: "Doutor criado com sucesso.",
      data: doutor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar doutor.",
    });
  }
});

// Atualizar doutor
router.put("/doutores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, cpf, crm, especialidade } = req.body;

    const doutor = await prisma.doutor.update({
      where: { id },
      data: {
        nome,
        email,
        telefone,
        cpf,
        crm,
        especialidade,
      },
    });

    res.status(200).json({
      success: true,
      message: "Doutor atualizado com sucesso.",
      data: doutor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar doutor.",
    });
  }
});

// Deletar doutor
router.delete("/doutores/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.doutor.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Doutor removido com sucesso.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover doutor.",
    });
  }
});

export default router;
