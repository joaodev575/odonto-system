import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { validatePasswordStrength } from "../middleware/security";

const router = express.Router();

// Request password reset - generates a token
router.post("/forgot-password", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      res.status(400).json({ success: false, message: "Username e obrigatorio." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });

    // Always return success to prevent username enumeration
    if (!user) {
      res.status(200).json({
        success: true,
        message: "Se o usuario existir, um token foi gerado.",
      });
      return;
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    res.status(200).json({
      success: true,
      message: "Token de recuperacao gerado.",
      token: token, // In production, this would be sent via email
    });
  } catch (error) {
    console.error("Erro no forgot-password:", error);
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
});

// Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ success: false, message: "Token e nova senha sao obrigatorios." });
      return;
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      res.status(400).json({ success: false, message: passwordCheck.message });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({ success: false, message: "Token invalido ou expirado." });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Senha redefinida com sucesso. Faca login.",
    });
  } catch (error) {
    console.error("Erro no reset-password:", error);
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
});

export default router;
