import { type Request, type Response, type NextFunction } from "express";

// Simple in-memory rate limiter
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimitLogin(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 10;

  const record = loginAttempts.get(ip);

  if (record && now < record.resetAt) {
    if (record.count >= maxAttempts) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        success: false,
        message: `Muitas tentativas. Tente novamente em ${Math.ceil(retryAfter / 60)} minutos.`,
      });
    }
    record.count++;
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
  }

  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of loginAttempts.entries()) {
    if (now > value.resetAt) loginAttempts.delete(key);
  }
}, 5 * 60 * 1000);

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
        // Remove script tags, event handlers, and javascript: URIs
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/\bon\w+\s*=/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/data:text\/html/gi, "");
      }
    }
  }
  next();
}

// Validation helpers
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) return { valid: false, message: "Senha deve ter pelo menos 8 caracteres" };
  if (!/[A-Z]/.test(password)) return { valid: false, message: "Senha deve conter pelo menos uma letra maiuscula" };
  if (!/[a-z]/.test(password)) return { valid: false, message: "Senha deve conter pelo menos uma letra minuscula" };
  if (!/[0-9]/.test(password)) return { valid: false, message: "Senha deve conter pelo menos um numero" };
  return { valid: true, message: "" };
}

export function validateStatus(status: string): boolean {
  return ["agendada", "concluida", "cancelada", "em_andamento"].includes(status);
}

export function validateRole(role: string): boolean {
  return ["user", "admin"].includes(role);
}

export function validateHorario(horario: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(horario);
}

export function validateDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

export function validateMaxLen(value: string, max: number, fieldName: string): string | null {
  if (value.length > max) return `${fieldName} deve ter no maximo ${max} caracteres`;
  return null;
}

export function validateRequired(fields: Record<string, unknown>, names: string[]): string | null {
  for (const name of names) {
    if (!fields[name]) return `${name} e obrigatorio`;
  }
  return null;
}
