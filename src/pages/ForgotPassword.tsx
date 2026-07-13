import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "loading" | "token" | "reset" | "success" | "error">("form");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setStep("loading");
    setLoadingMsg("Verificando usuario...");
    setLoading(true);

    // Animated steps
    await new Promise((r) => setTimeout(r, 800));
    setLoadingMsg("Gerando token de recuperacao...");
    await new Promise((r) => setTimeout(r, 600));
    setLoadingMsg("Processando...");
    await new Promise((r) => setTimeout(r, 500));

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        setToken(data.token);
        setStep("token");
      } else {
        setStep("error");
        setErrorMsg("Nenhum usuario encontrado com esse nome.");
      }
    } catch {
      setStep("error");
      setErrorMsg("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMsg("As senhas nao coincidem.");
      setStep("error");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("A senha deve ter pelo menos 8 caracteres.");
      setStep("error");
      return;
    }

    setStep("loading");
    setLoadingMsg("Redefinindo senha...");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));
    setLoadingMsg("Salvando nova senha...");
    await new Promise((r) => setTimeout(r, 600));
    setLoadingMsg("Criptografando...");
    await new Promise((r) => setTimeout(r, 500));

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setStep("success");
      } else {
        setStep("error");
        setErrorMsg(data.message || "Erro ao redefinir senha.");
      }
    } catch {
      setStep("error");
      setErrorMsg("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#00a884] via-[#00c9a0] to-[#00d4a7] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
              <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-3">Recuperar Senha</h1>
            <p className="text-white/80 text-lg">Nao se preocupe, vamos ajudar voce a recuperar o acesso.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">1. Informe seu usuario</p>
                <p className="text-sm text-white/70">Vamos verificar sua conta</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">2. Receba o token</p>
                <p className="text-sm text-white/70">Token de seguranca gerado</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">3. Crie uma nova senha</p>
                <p className="text-sm text-white/70">Escolha uma senha forte</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-[#00a884] to-[#00d4a7] items-center justify-center mb-4 shadow-lg shadow-[#00a884]/20">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </Link>
          </div>

          {/* Step: Form - Enter username */}
          {step === "form" && (
            <div className="animate-fade-in">
              <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#00a884] transition-colors mb-6">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Voltar ao login
              </Link>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Esqueceu a senha?</h2>
              <p className="text-gray-500 mb-8">Informe seu usuario para gerar um token de recuperacao.</p>
              <form onSubmit={handleRequestToken} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuario"
                    required
                    autoFocus
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!username.trim()}
                  className="w-full bg-gradient-to-r from-[#00a884] to-[#00c9a0] hover:from-[#009a78] hover:to-[#00b894] text-white font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#00a884]/25 active:scale-[0.98]"
                >
                  Gerar Token
                </button>
              </form>
            </div>
          )}

          {/* Step: Loading animation */}
          {step === "loading" && (
            <div className="animate-fade-in text-center py-12">
              <div className="inline-flex h-20 w-20 rounded-full bg-[#00a884]/10 items-center justify-center mb-6">
                <svg className="h-10 w-10 text-[#00a884] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">{loadingMsg}</p>
              <div className="flex justify-center gap-1 mt-4">
                <div className="h-2 w-2 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="h-2 w-2 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="h-2 w-2 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}

          {/* Step: Show token */}
          {step === "token" && (
            <div className="animate-fade-in">
              <div className="text-center mb-6">
                <div className="inline-flex h-16 w-16 rounded-full bg-emerald-50 items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Token Gerado!</h2>
                <p className="text-sm text-gray-500">Copie o token abaixo e use para redefinir sua senha.</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 mb-6">
                <code className="text-xs text-gray-700 break-all block font-mono">{token}</code>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(token); }}
                className="w-full mb-3 py-2.5 text-sm font-medium text-[#00a884] bg-[#00a884]/10 hover:bg-[#00a884]/20 rounded-xl transition-colors cursor-pointer"
              >
                Copiar Token
              </button>
              <button
                onClick={() => setStep("reset")}
                className="w-full bg-gradient-to-r from-[#00a884] to-[#00c9a0] hover:from-[#009a78] hover:to-[#00b894] text-white font-semibold rounded-xl py-3 text-sm transition-all cursor-pointer shadow-lg shadow-[#00a884]/25 active:scale-[0.98]"
              >
                Redefinir Senha
              </button>
            </div>
          )}

          {/* Step: Reset password form */}
          {step === "reset" && (
            <div className="animate-fade-in">
              <div className="text-center mb-6">
                <div className="inline-flex h-16 w-16 rounded-full bg-[#00a884]/10 items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-[#00a884]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Nova Senha</h2>
                <p className="text-sm text-gray-500">Escolha uma senha forte com pelo menos 8 caracteres.</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Token</label>
                  <input
                    type="text"
                    value={token}
                    readOnly
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-100 text-gray-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nova Senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimo 8 caracteres"
                    required
                    autoFocus
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar Senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    required
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500">As senhas nao coincidem</p>
                )}
                <button
                  type="submit"
                  disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full bg-gradient-to-r from-[#00a884] to-[#00c9a0] hover:from-[#009a78] hover:to-[#00b894] text-white font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#00a884]/25 active:scale-[0.98]"
                >
                  Redefinir Senha
                </button>
              </form>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="animate-fade-in text-center py-8">
              <div className="inline-flex h-20 w-20 rounded-full bg-emerald-50 items-center justify-center mb-6">
                <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Senha Redefinida!</h2>
              <p className="text-gray-500 mb-8">Sua senha foi alterada com sucesso. Faca login com a nova senha.</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00a884] to-[#00c9a0] text-white font-semibold rounded-xl shadow-lg shadow-[#00a884]/25 hover:shadow-xl transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Ir para o Login
              </Link>
            </div>
          )}

          {/* Step: Error */}
          {step === "error" && (
            <div className="animate-fade-in text-center py-8">
              <div className="inline-flex h-20 w-20 rounded-full bg-red-50 items-center justify-center mb-6">
                <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro</h2>
              <p className="text-gray-500 mb-8">{errorMsg}</p>
              <button
                onClick={() => { setStep("form"); setErrorMsg(""); setUsername(""); }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00a884] to-[#00c9a0] text-white font-semibold rounded-xl shadow-lg shadow-[#00a884]/25 hover:shadow-xl transition-all cursor-pointer"
              >
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
