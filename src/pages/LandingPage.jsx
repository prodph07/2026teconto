import React, { useState, useEffect, useRef } from 'react';
import { Hourglass, Lock, Mic, Rocket, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const canvasRef = useRef(null);
  
  // SEU LINK DE PAGAMENTO
  const handleCompra = () => {
    window.location.href = "https://pay.kirvano.com/4e7a15f5-2c9e-4ce2-9dd1-c926ee2734a3"; 
  };

  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  // Lógica do Contador
  useEffect(() => {
    const targetDate = new Date('January 1, 2026 00:00:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: days < 10 ? `0${days}` : days.toString(),
        hours: hours < 10 ? `0${hours}` : hours.toString(),
        minutes: minutes < 10 ? `0${minutes}` : minutes.toString(),
        seconds: seconds < 10 ? `0${seconds}` : seconds.toString(),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Lógica de Estrelas (Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId;
    canvas.width = width;
    canvas.height = height;
    const stars = [];

    class Star {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2; // Estrelas um pouco maiores
        this.speedX = (Math.random() - 0.5) * 0.1;
        this.speedY = (Math.random() - 0.5) * 0.1;
        this.opacity = Math.random();
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0) this.x = width; if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height; if (this.y > height) this.y = 0;
        this.opacity += (Math.random() - 0.5) * 0.02;
        if (this.opacity < 0.1) this.opacity = 0.1;
        if (this.opacity > 1) this.opacity = 1;
      }
      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 200; i++) stars.push(new Star());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => { star.update(); star.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', handleResize); };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col antialiased text-white bg-[#020205] overflow-x-hidden font-sans selection:bg-pink-500 selection:text-white">
      
      {/* Forçando a fonte Outfit globalmente neste componente */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&display=swap');
        body, h1, h2, h3, p, span, div { font-family: 'Outfit', sans-serif; }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 40px rgba(0,0,0,0.5);
        }
      `}</style>

      {/* Canvas Fundo */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#13132e] via-[#020205] to-[#000000]" />

      {/* Navbar */}
      <nav className="w-full py-8 px-6 md:px-12 flex justify-between items-center z-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Hourglass className="text-pink-500 w-6 h-6" />
          <span className="font-bold text-xl tracking-[0.2em] text-white">
            TIME<span className="text-purple-500">CAPSULE</span>
          </span>
        </div>
        
        {/* Badge Viral - Topo Direito */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs font-semibold text-gray-300 tracking-wide">Viralizando no Brasil</span>
        </div>
      </nav>

      {/* Hero Section - Onde está o texto grande */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 z-10 text-center mt-4 mb-20 w-full relative">
        
        {/* Texto Principal */}
        <div className="max-w-5xl mx-auto space-y-4">
          <h1 className="text-5xl md:text-8xl font-[900] tracking-tighter leading-[0.95] text-white drop-shadow-2xl">
            Envie uma mensagem<br />
            {/* Gradiente Exato da Imagem: Rosa -> Roxo -> Laranja */}
            <span className="bg-gradient-to-r from-[#ff6ac2] via-[#a855f7] to-[#ffaf38] bg-clip-text text-transparent">
              para o futuro.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed pt-6">
            Crie uma cápsula do tempo digital com fotos e áudio. <br className="hidden md:block" />
            Seu link ficará <strong className="text-white border-b-2 border-pink-500/50 pb-0.5">bloqueado</strong> até a meia-noite da virada do ano.
          </p>

          {/* Contador Estilo "Placa de Aeroporto/Digital" */}
          <div className="py-10 flex justify-center">
            <div className="glass-panel px-6 py-6 md:px-12 md:py-8 rounded-3xl flex items-center justify-center gap-4 md:gap-10">
              
              <div className="text-center">
                <span className="block text-4xl md:text-6xl font-[800] text-white tracking-tight">{timeLeft.days}</span>
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Dias</span>
              </div>
              
              <div className="text-2xl md:text-4xl font-light text-gray-700 -mt-4">:</div>
              
              <div className="text-center">
                <span className="block text-4xl md:text-6xl font-[800] text-white tracking-tight">{timeLeft.hours}</span>
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Horas</span>
              </div>
              
              <div className="text-2xl md:text-4xl font-light text-gray-700 -mt-4">:</div>
              
              <div className="text-center">
                <span className="block text-4xl md:text-6xl font-[800] text-white tracking-tight">{timeLeft.minutes}</span>
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Min</span>
              </div>
              
              <div className="text-2xl md:text-4xl font-light text-gray-700 -mt-4">:</div>
              
              <div className="text-center">
                <span className="block text-4xl md:text-6xl font-[800] text-pink-500 tracking-tight">{timeLeft.seconds}</span>
                <span className="text-[10px] md:text-xs font-bold text-pink-500/70 uppercase tracking-widest mt-1">Seg</span>
              </div>

            </div>
          </div>
          <p className="text-xs text-gray-600 uppercase tracking-[0.2em] font-bold">Até 01/01/2026</p>

          {/* Botão de Ação */}
          <div className="pt-8">
            <button 
              onClick={handleCompra}
              className="relative group px-8 py-4 md:px-10 md:py-6 bg-white text-black rounded-full font-[800] text-lg md:text-xl tracking-tight transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-3 mx-auto"
            >
              <span>Criar Minha Cápsula</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              
              {/* Brilho atrás do botão */}
              <div className="absolute -inset-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity -z-10"></div>
            </button>
            <p className="text-xs text-gray-500 mt-4 flex justify-center items-center gap-1.5 opacity-60">
              <Lock size={12} /> Pagamento Único & Seguro
            </p>
          </div>
        </div>

      </main>

      {/* Rodapé Simples */}
      <footer className="py-6 text-center text-gray-800 text-xs font-medium uppercase tracking-wider relative z-10">
        &copy; 2025 TimeCapsule
      </footer>
    </div>
  );
}