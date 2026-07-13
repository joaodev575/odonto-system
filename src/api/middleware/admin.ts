import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não configurado");
  return secret;
}

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Acesso negado." });
  }

  const token = authHeader.split(" ")[1]!;

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string; username: string };
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token invalido." });
  }
}

export async function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, message: "Nao autenticado." });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "admin") {
    return res.status(403).json({ success: false, message: "Acesso restrito a administradores." });
  }

  next();
}
