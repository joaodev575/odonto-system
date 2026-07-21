import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

// Validate JWT_SECRET at startup
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error("ERRO: JWT_SECRET deve ter pelo menos 16 caracteres. Configure a variavel de ambiente.");
  process.exit(1);
}

import authRoutes from "./routes/login";
import registerRoutes from "./routes/register";
import passwordRoutes from "./routes/password";
import pacienteRoutes from "./routes/pacientes";
import doutorRoutes from "./routes/doutores";
import consultaRoutes from "./routes/consultas";
import adminRoutes from "./routes/admin";
import especialidadeRoutes from "./routes/especialidades";
import { auth } from "./middleware/auth";
import { rateLimitLogin, requestLogger, sanitizeInput } from "./middleware/security";

const app = express();

// Security headers
app.use(helmet());

// CORS - stricter configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Nao permitido pelo CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Body parser with size limit
app.use(express.json({ limit: "500kb" }));

// Logging and sanitization
app.use(requestLogger);
app.use(sanitizeInput);

// Rate limit on auth routes
app.use("/login", rateLimitLogin);
app.use("/register", rateLimitLogin);

// Public routes
app.use(authRoutes);
app.use(registerRoutes);
app.use(passwordRoutes);

// Protected routes
app.use(auth);

app.get("/", (_req, res) => {
  res.json({ message: "API funcionando!" });
});

app.use(pacienteRoutes);
app.use(doutorRoutes);
app.use(consultaRoutes);
app.use(especialidadeRoutes);
app.use(adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Rota nao encontrada." });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Erro interno do servidor." });
});

app.listen(3333, () => {
  console.log("Servidor rodando na porta 3333");
});
