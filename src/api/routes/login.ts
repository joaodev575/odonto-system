import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ success: false, message: "Usuario e senha sao obrigatorios." });
            return;
        }

        if (typeof username !== "string" || username.length > 50) {
            res.status(400).json({ success: false, message: "Username invalido." });
            return;
        }

        if (typeof password !== "string" || password.length > 128) {
            res.status(400).json({ success: false, message: "Senha invalida." });
            return;
        }

        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            res.status(401).json({ success: false, message: "Usuario ou senha invalidos." });
            return;
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            res.status(401).json({ success: false, message: "Usuario ou senha invalidos." });
            return;
        }

        const secret = process.env.JWT_SECRET!;
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            secret,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Login realizado com sucesso.",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    }
});

export default router;
