import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertTriangle, CheckCircle, Home } from 'lucide-react';

export default function ValidatePayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState("Iniciando validação...");
  const [debugInfo, setDebugInfo] = useState("");
  const [isError, setIsError] = useState(false);

  // Pega o ID da transação da Kirvano (ref ou id)
  const paymentId = searchParams.get('ref') || searchParams.get('id') || searchParams.get('transaction_id');

  useEffect(() => {
    async function validate() {
      // 1. Tenta recuperar qual cápsula estava sendo criada
      const pendingCapsuleId = localStorage.getItem('pending_capsule_id');

      let debugLog = `PaymentID: ${paymentId || 'NÃO VEIO'}\nCapsuleID (Local): ${pendingCapsuleId || 'PERDIDO'}`;
      setDebugInfo(debugLog);

      // CASO 1: Link sem código de pagamento (Acesso direto incorreto)
      if (!paymentId) {
        setStatus("Erro: Link de pagamento inválido.");
        setIsError(true);
        return;
      }

      // CASO 2: Navegador esqueceu a cápsula (Troca de aba/Navegador)
      if (!pendingCapsuleId) {
        setStatus("Sessão expirada ou navegador trocado.");
        setIsError(true);
        return;
      }

      try {
        setStatus("Confirmando pagamento no sistema...");

        // 3. Tenta ATUALIZAR no banco
        const { data, error } = await supabase
          .from('capsules')
          .update({ order_id: paymentId })
          .eq('id', pendingCapsuleId)
          .select();

        if (error) {
          throw error;
        }

        // Se não retornou dados, pode ser que o ID não exista ou RLS bloqueou
        if (!data || data.length === 0) {
          throw new Error("Cápsula não encontrada ou bloqueada pelo banco.");
        }

        // 4. SUCESSO!
        localStorage.removeItem('pending_capsule_id'); // Limpa memória
        setStatus("Pagamento Confirmado! Redirecionando...");
        
        setTimeout(() => {
            navigate(`/v/${pendingCapsuleId}`);
        }, 1500);

      } catch (error) {
        console.error("Erro Supabase:", error);
        setStatus(`Erro no Banco de Dados: ${error.message}`);
        setDebugInfo(prev => prev + `\nErro: ${error.message}`);
        setIsError(true);
      }
    }

    validate();
  }, [paymentId, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      
      {!isError ? (
        // --- TELA DE CARREGAMENTO ---
        <div className="flex flex-col items-center gap-6 animate-fade-in-up">
           <div className="relative">
             <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
             <Loader2 className="animate-spin text-purple-400 w-16 h-16 relative z-10" />
           </div>
           <h2 className="text-xl font-bold text-zinc-200">{status}</h2>
           <p className="text-xs text-zinc-600 font-mono mt-4 border border-zinc-800 p-2 rounded max-w-xs break-all">
             {debugInfo}
           </p>
        </div>
      ) : (
        // --- TELA DE ERRO (COM SOLUÇÃO) ---
        <div className="max-w-md w-full bg-zinc-900 border border-red-500/30 p-8 rounded-3xl shadow-2xl animate-fade-in-up">
           <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500 w-10 h-10" />
           </div>
           
           <h2 className="text-2xl font-bold text-white mb-2">Não foi possível validar</h2>
           <p className="text-zinc-400 mb-6">{status}</p>
           
           {/* Caixa de Diagnóstico */}
           <div className="bg-black/50 p-4 rounded-xl mb-6 text-left border border-zinc-800">
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Dados Técnicos (Mande no suporte)</p>
              <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap break-all">
                {debugInfo}
              </pre>
           </div>

           <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
             Se você já realizou o pagamento, sua cápsula está segura. <br/>
             Tire um print desta tela e nos envie.
           </p>

           <button 
             onClick={() => navigate('/')} 
             className="w-full py-4 bg-white text-black hover:bg-zinc-200 rounded-xl transition font-bold flex items-center justify-center gap-2"
           >
             <Home size={18} /> Voltar ao Início
           </button>
        </div>
      )}
    </div>
  );
}