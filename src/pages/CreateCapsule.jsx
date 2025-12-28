import { useState, useRef } from 'react';
import { supabase } from '../supabase'; 
import imageCompression from 'browser-image-compression';
import { Mic, Square, Image as ImageIcon, Loader2, Send, Trash2, Plus, Lock } from 'lucide-react';

export default function CreateCapsule() {
  const [photos, setPhotos] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // --- LÓGICA DE ÁUDIO ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Precisamos de permissão do microfone! Verifique se seu navegador permite.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // --- LÓGICA DE FOTOS ---
  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 3) {
      alert("Máximo de 3 fotos!");
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // --- ENVIO (COM REDIRECIONAMENTO) ---
  const handleSubmit = async () => {
    if (!audioBlob && photos.length === 0) return alert("Adicione pelo menos uma foto ou áudio!");
    setLoading(true);

    try {
      const photoUrls = [];
      let audioUrl = null;

      // 1. Upload do Áudio
      if (audioBlob) {
        const audioName = `audio_${Date.now()}.webm`;
        const { error: audioError } = await supabase.storage.from('files').upload(audioName, audioBlob);
        if (audioError) throw audioError;
        const { data: audioPublic } = supabase.storage.from('files').getPublicUrl(audioName);
        audioUrl = audioPublic.publicUrl;
      }

      // 2. Upload das Fotos
      for (let photo of photos) {
        const compressedFile = await imageCompression(photo, { maxSizeMB: 0.5, maxWidthOrHeight: 1280 });
        const fileName = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
        const { error: photoError } = await supabase.storage.from('files').upload(fileName, compressedFile);
        if (photoError) throw photoError;
        const { data: photoPublic } = supabase.storage.from('files').getPublicUrl(fileName);
        photoUrls.push(photoPublic.publicUrl);
      }

      const unlockDate = new Date('2026-01-01T00:00:00'); 
      
      // 3. Salvar no Banco
      const { data, error } = await supabase
        .from('capsules')
        .insert([{ 
            message: message,
            audio_url: audioUrl,
            photo_urls: photoUrls,
            unlock_at: unlockDate
        }])
        .select();

      if (error) throw error;

      // --- MUDANÇA AQUI: REDIRECIONA PARA A PÁGINA FINAL ---
      window.location.href = `/v/${data[0].id}`;
      
    } catch (error) {
      console.error(error);
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- VISUAL ---
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-purple-500 selection:text-white pb-20">
      
      {/* Barra de Progresso Falsa (Charme) */}
      <div className="w-full h-1 bg-zinc-900 sticky top-0 z-50">
        <div className="w-1/3 h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
      </div>

      <div className="max-w-md mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-zinc-900 rounded-2xl mb-4 border border-zinc-800 shadow-xl">
            <Lock className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent">
            Criar Cápsula
          </h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">
            Destino: 2026
          </p>
        </div>

        {/* Card de Fotos */}
        <div className="bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-zinc-800/50 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-bold text-zinc-300">Suas Memórias</label>
            <span className="text-xs font-mono text-zinc-600 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">{photos.length}/3</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {photos.map((p, i) => (
              <div key={i} className="aspect-square relative group">
                <img src={URL.createObjectURL(p)} className="w-full h-full object-cover rounded-xl border border-zinc-700" />
                <button 
                  onClick={() => removePhoto(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            
            {photos.length < 3 && (
              <label className="aspect-square bg-zinc-950/50 rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-900 transition-all group">
                <Plus size={24} className="text-zinc-600 group-hover:text-purple-400 transition-colors" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
              </label>
            )}
          </div>
        </div>

        {/* Card de Áudio */}
        <div className="bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-zinc-800/50 shadow-2xl flex flex-col items-center">
          <label className="text-sm font-bold text-zinc-300 w-full mb-6">Mensagem de Voz</label>
          
          <div className="relative">
            {isRecording && (
               <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
            )}
            
            {!audioBlob ? (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${
                  isRecording 
                    ? 'bg-gradient-to-tr from-red-500 to-orange-500 scale-110 border-4 border-zinc-900' 
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 hover:scale-105 hover:shadow-purple-500/20'
                }`}
              >
                {isRecording ? <Square fill="white" size={28} /> : <Mic size={36} className="text-white" />}
              </button>
            ) : (
              <div className="flex items-center gap-4 bg-zinc-950 px-6 py-4 rounded-2xl border border-zinc-800 w-full">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <Mic size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">Áudio Gravado</p>
                  <p className="text-xs text-zinc-500">Pronto para envio</p>
                </div>
                <button onClick={() => setAudioBlob(null)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-red-400 transition">
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
          
          <p className="mt-6 text-xs text-zinc-500 font-mono">
            {isRecording ? "GRAVANDO... Mantenha breve." : audioBlob ? "" : "Toque para gravar"}
          </p>
        </div>

        {/* Área de Texto */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
          <textarea 
            className="relative w-full bg-zinc-900 text-white rounded-xl p-5 text-base border border-zinc-800 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder:text-zinc-600 resize-none transition-all"
            placeholder="Deixe uma mensagem para o futuro..."
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        {/* Botão Final */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          {loading ? (
            <Loader2 className="animate-spin text-zinc-400" />
          ) : (
            <>
              <span>Lacrar Cápsula</span>
              <Send size={20} />
            </>
          )}
        </button>

        <p className="text-center text-xs text-zinc-600">
          Seus dados serão criptografados até 01/01/2026
        </p>

      </div>
    </div>
  );
}