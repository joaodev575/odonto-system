import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não configurado");
  }
  return secret;
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const publicRoutes = ["/login", "/register", "/"];

  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Acesso negado."
    });
  }

  const token = authHeader.split(" ")[1]!;

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token inválido."
    });
  }
}