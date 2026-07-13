import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <div className="inline-flex h-24 w-24 rounded-3xl bg-gradient-to-br from-[#00a884] to-[#00d4a7] items-center justify-center mb-6 shadow-xl shadow-[#00a884]/20">
          <span className="text-5xl font-black text-white">404</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagina nao encontrada</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          A pagina que voce procura nao existe ou foi movida para outro endereco.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00a884] to-[#00c9a0] text-white font-semibold rounded-xl shadow-lg shadow-[#00a884]/25 hover:shadow-xl hover:shadow-[#00a884]/30 transition-all"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Voltar ao Inicio
        </Link>
      </div>
    </div>
  );
}
