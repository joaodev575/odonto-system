import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

// Listar todos os pacientes
router.get("/pacientes", async (_req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: pacientes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar pacientes.",
    });
  }
});

// Buscar paciente por ID
router.get("/pacientes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await prisma.paciente.findUnique({
      where: { id },
    });

    if (!paciente) {
      res.status(404).json({
        success: false,
        message: "Paciente não encontrado.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: paciente,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar paciente.",
    });
  }
});

// Criar novo paciente
router.post("/pacientes", async (req, res) => {
  try {
    const { nome, email, telefone, cpf, endereco, dataNascimento } = req.body;

    if (!nome || !email) {
      res.status(400).json({
        success: false,
        message: "Nome e email são obrigatórios.",
      });
      return;
    }

    const paciente = await prisma.paciente.create({
      data: {
        nome,
        email,
        telefone,
        cpf,
        endereco,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Paciente criado com sucesso.",
      data: paciente,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar paciente.",
    });
  }
});

// Atualizar paciente
router.put("/pacientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, cpf, endereco, dataNascimento } = req.body;

    const paciente = await prisma.paciente.update({
      where: { id },
      data: {
        nome,
        email,
        telefone,
        cpf,
        endereco,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Paciente atualizado com sucesso.",
      data: paciente,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar paciente.",
    });
  }
});

// Deletar paciente
router.delete("/pacientes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.paciente.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Paciente removido com sucesso.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover paciente.",
    });
  }
});

export default router;
