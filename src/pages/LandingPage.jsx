import { useNavigate } from 'react-router-dom';
import { Lock, Clock, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  // AQUI VOCÊ VAI COLOCAR O LINK DO SEU CHECKOUT DA KIRVANO
  // Por enquanto, deixei redirecionando direto para criar apenas para testes
  const handleCompra = () => {
     // Quando tiver o link da Kirvano, você usará: window.location.href = "SEU_LINK_KIRVANO";
     navigate('/criar'); 
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full mb-8 animate-fade-in">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-zinc-400">Viralizando agora no Brasil</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
          Envie uma mensagem <br /> para o futuro.
        </h1>

        <p className="text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Crie uma cápsula do tempo digital com fotos e áudio. 
          Seu link ficará <span className="text-purple-400 font-bold">bloqueado</span> até a meia-noite da virada do ano.
        </p>

        <button 
          onClick={handleCompra}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-purple-600 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 offset-zinc-900"
        >
          Criar Minha Cápsula Agora
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <div className="absolute -inset-3 rounded-full bg-purple-600 opacity-20 group-hover:opacity-40 blur-lg transition-opacity" />
        </button>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <Lock className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Bloqueio Real</h3>
            <p className="text-zinc-400">O link gerado é criptografado e só libera o acesso quando o relógio bater 00:00 de 01/01/2026.</p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <Clock className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Eternize o Momento</h3>
            <p className="text-zinc-400">Guarde o sentimento exato de hoje. Fotos e sua voz gravada para a posteridade.</p>
          </div>
           <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <span className="text-4xl mb-4 block">🚀</span>
            <h3 className="text-xl font-bold mb-2">Experiência Viral</h3>
            <p className="text-zinc-400">Crie a tendência. Envie para amigos e veja a reação deles ao receber um mistério.</p>
          </div>
        </div>
      </div>
    </div>
  );
}