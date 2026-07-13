import express from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { validatePasswordStrength, validateEmail } from "../middleware/security";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: "Username e senha sao obrigatorios." });
      return;
    }

    if (typeof username !== "string" || username.length < 3 || username.length > 50) {
      res.status(400).json({ success: false, message: "Username deve ter entre 3 e 50 caracteres." });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      res.status(400).json({ success: false, message: "Username deve conter apenas letras, numeros e underscore." });
      return;
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      res.status(400).json({ success: false, message: passwordCheck.message });
      return;
    }

    if (email && !validateEmail(email)) {
      res.status(400).json({ success: false, message: "Email invalido." });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      res.status(409).json({ success: false, message: "Username ja existe." });
      return;
    }

    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        res.status(409).json({ success: false, message: "Email ja esta em uso." });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email: email || null,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      success: true,
      message: "Conta criada com sucesso.",
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
});

export default router;
