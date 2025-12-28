import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Lock, Unlock, Play, Pause } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ViewCapsule() {
  const { id } = useParams(); 
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});
  const [isLocked, setIsLocked] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchCapsule();
  }, [id]);

  async function fetchCapsule() {
    try {
      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      console.log("Dados recebidos:", data); // Para ajudar a gente a ver o erro no console se houver
      setCapsule(data);
      checkLockStatus(data.unlock_at);
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar cápsula.");
    } finally {
      setLoading(false);
    }
  }

  function checkLockStatus(unlockDateString) {
    const unlockDate = new Date(unlockDateString).getTime();
    const now = new Date().getTime();

    // SE A DATA ATUAL FOR MAIOR QUE A DATA DE DESBLOQUEIO
    if (now >= unlockDate) {
      setIsLocked(false);
      triggerConfetti();
    } else {
      setIsLocked(true);
      // Lógica do contador...
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = unlockDate - now;

        if (distance < 0) {
          clearInterval(timer);
          setIsLocked(false);
          triggerConfetti();
        } else {
          setTimeLeft({
            dias: Math.floor(distance / (1000 * 60 * 60 * 24)),
            horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            min: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seg: Math.floor((distance % (1000 * 60)) / 1000),
          });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }

  function triggerConfetti() {
    // Só solta confete uma vez para não travar o navegador
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 pb-20">
      
      {isLocked ? (
        // --- TELA BLOQUEADA ---
        <div className="text-center space-y-8 animate-pulse">
          <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border-4 border-zinc-800 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Lock size={40} className="text-purple-500" />
          </div>
          
          <h1 className="text-3xl font-bold">Mensagem do Passado</h1>
          <p className="text-zinc-400">Desbloqueia em 01/01/2026</p>

          <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div key={label} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <span className="block text-2xl font-bold font-mono text-purple-400">{value || 0}</span>
                <span className="text-xs text-zinc-500 uppercase">{label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        
        // --- TELA DESBLOQUEADA ---
        <div className="max-w-md w-full space-y-6 animate-fade-in-up">
          <div className="text-center mb-8">
             <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-1 rounded-full text-sm font-bold mb-4 border border-green-500/20">
               <Unlock size={14} /> DESBLOQUEADO
             </div>
             <h1 className="text-3xl font-bold">Sua Cápsula do Tempo</h1>
          </div>

          {/* Fotos (Agora com proteção para não quebrar se estiver vazio) */}
          <div className="flex flex-col gap-4">
             {capsule?.photo_urls && Array.isArray(capsule.photo_urls) && capsule.photo_urls.map((url, i) => (
               <img key={i} src={url} className="w-full rounded-2xl border border-zinc-800 shadow-2xl" />
             ))}
          </div>

          {/* Áudio Player */}
          {capsule?.audio_url && (
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center gap-4 shadow-lg">
              <button 
                onClick={() => {
                  const audio = document.getElementById('audio-player');
                  if(!audio) return;
                  isPlaying ? audio.pause() : audio.play();
                  setIsPlaying(!isPlaying);
                }}
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition shrink-0"
              >
                {isPlaying ? <Pause size={20} fill="black"/> : <Play size={20} fill="black" className="ml-1"/>}
              </button>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">Mensagem de Voz</p>
                <p className="text-xs text-zinc-500">Clique para ouvir</p>
              </div>
              <audio id="audio-player" src={capsule.audio_url} onEnded={() => setIsPlaying(false)} className="hidden"></audio>
            </div>
          )}

          {/* Mensagem de Texto */}
          {capsule?.message && (
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 italic text-zinc-300 text-center text-lg font-serif">
              "{capsule.message}"
            </div>
          )}
        </div>
      )}
      {/* --- BOTÃO VIRAL (Adicione isso no final do bloco "DESBLOQUEADO") --- */}
          <div className="mt-12 pt-8 border-t border-zinc-900 text-center">
            <p className="text-zinc-500 text-sm mb-4">Gostou da surpresa?</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-white font-bold text-sm hover:bg-zinc-800 transition shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            >
              Criar minha Cápsula também 🚀
            </button>
          </div>
    </div>
  );
}