import { useState } from 'react';
import { Link } from 'react-router-dom';

type LoginStep = "form" | "loading" | "success" | "error";

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<LoginStep>("form");
  const [loadingMsg, setLoadingMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Start animated loading
    setStep("loading");

    if (isRegister) {
      setLoadingMsg("Criando sua conta...");
      await delay(700);
      setLoadingMsg("Salvando dados...");
      await delay(500);
      setLoadingMsg("Finalizando cadastro...");
      await delay(400);
    } else {
      setLoadingMsg("Conectando ao servidor...");
      await delay(500);
      setLoadingMsg("Verificando usuario...");
      await delay(700);
      setLoadingMsg("Validando credenciais...");
      await delay(600);
      setLoadingMsg("Verificando permissoes...");
      await delay(400);
    }

    try {
      const url = isRegister ? '/api/register' : '/api/login';
      const body = isRegister ? { username, password, email } : { username, password };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegister) {
          setLoadingMsg("Conta criada com sucesso!");
          await delay(800);
          setStep("form");
          setIsRegister(false);
          setPassword('');
          setSuccess('Conta criada com sucesso! Faca login.');
        } else {
          setLoadingMsg("Autenticando...");
          await delay(500);
          setLoadingMsg("Preparando dashboard...");
          await delay(400);

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          setStep("success");
          setLoadingMsg("Redirecionando...");
          await delay(800);
          window.location.href = '/dashboard';
        }
      } else {
        // Show specific error based on message
        setLoadingMsg("");
        await delay(300);

        if (data.message?.includes("senha") || data.message?.includes("credenciais")) {
          setLoadingMsg("Credenciais invalidas...");
          await delay(600);
        } else if (data.message?.includes("usuario")) {
          setLoadingMsg("Usuario nao encontrado...");
          await delay(600);
        } else if (data.message?.includes("permissao") || data.message?.includes("acesso")) {
          setLoadingMsg("Sem permissao de acesso...");
          await delay(600);
        } else if (data.message?.includes("muitas") || data.message?.includes("bloqueado")) {
          setLoadingMsg("Conta bloqueada temporariamente...");
          await delay(600);
        } else {
          setLoadingMsg("Erro na autenticacao...");
          await delay(600);
        }

        setStep("error");
        setError(data.message || 'Erro ao processar solicitacao.');
      }
    } catch {
      setLoadingMsg("Erro de conexao...");
      await delay(600);
      setStep("error");
      setError('Erro ao conectar com o servidor.');
    }
  };

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const resetForm = () => {
    setStep("form");
    setError('');
    setSuccess('');
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-3">Odonto</h1>
            <p className="text-white/80 text-lg">Sistema completo para gerenciamento odontologico</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Gestao de Pacientes</p>
                <p className="text-sm text-white/70">Cadastro completo e historico</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Agendamento de Consultas</p>
                <p className="text-sm text-white/70">Calendario inteligente</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Relatorios e Metricas</p>
                <p className="text-sm text-white/70">Dados em tempo real</p>
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
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-[#00a884] to-[#00d4a7] items-center justify-center mb-4 shadow-lg shadow-[#00a884]/20">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
          </div>

          {/* Step: Form */}
          {step === "form" && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{isRegister ? 'Criar Conta' : 'Bem-vindo de volta'}</h2>
                <p className="text-gray-500 mt-1.5">
                  {isRegister ? 'Preencha os dados para criar sua conta' : 'Entre com suas credenciais para acessar'}
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/60 flex items-center gap-2.5 animate-fade-in">
                  <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-5 p-3.5 rounded-xl bg-green-50 border border-green-200/60 flex items-center gap-2.5 animate-fade-in">
                  <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuario"
                    required
                    autoFocus
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all duration-200 placeholder:text-gray-400"
                  />
                </div>

                {isRegister && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all duration-200 placeholder:text-gray-400"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 outline-none transition-all duration-200 placeholder:text-gray-400"
                  />
                </div>

                {!isRegister && (
                  <div className="flex justify-end">
                    <Link to="/esqueci-senha" className="text-sm text-[#00a884] hover:text-[#009a78] font-medium transition-colors">
                      Esqueceu a senha?
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!username || !password}
                  className="w-full bg-gradient-to-r from-[#00a884] to-[#00c9a0] hover:from-[#009a78] hover:to-[#00b894] text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#00a884]/25 hover:shadow-xl hover:shadow-[#00a884]/30 active:scale-[0.98]"
                >
                  {isRegister ? 'Criar Conta' : 'Entrar'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                    setSuccess('');
                    setPassword('');
                  }}
                  className="text-sm text-gray-500 hover:text-[#00a884] transition-colors cursor-pointer"
                >
                  {isRegister ? 'Ja tem conta? Fazer login' : 'Nao tem conta? Criar conta'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Loading */}
          {step === "loading" && (
            <div className="animate-fade-in text-center py-16">
              <div className="inline-flex h-24 w-24 rounded-full bg-[#00a884]/10 items-center justify-center mb-8">
                <div className="relative">
                  <svg className="h-12 w-12 text-[#00a884] animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900 mb-3">{loadingMsg}</p>
              <div className="flex justify-center gap-1.5 mt-6">
                <div className="h-2.5 w-2.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="h-2.5 w-2.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="h-2.5 w-2.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="animate-fade-in text-center py-16">
              <div className="inline-flex h-24 w-24 rounded-full bg-emerald-50 items-center justify-center mb-8">
                <svg className="h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">Login realizado!</p>
              <p className="text-gray-500">{loadingMsg}</p>
            </div>
          )}

          {/* Step: Error */}
          {step === "error" && (
            <div className="animate-fade-in text-center py-16">
              <div className="inline-flex h-24 w-24 rounded-full bg-red-50 items-center justify-center mb-8">
                <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">{loadingMsg || "Erro na autenticacao"}</p>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">{error}</p>
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00a884] to-[#00c9a0] text-white font-semibold rounded-xl shadow-lg shadow-[#00a884]/25 hover:shadow-xl transition-all cursor-pointer active:scale-[0.98]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
