import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ValidatePayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState("Validando...");
  const [errorMode, setErrorMode] = useState(false);

  // Pega o ID da transação da Kirvano (ref ou id)
  const paymentId = searchParams.get('ref') || searchParams.get('id');

  useEffect(() => {
    async function validate() {
      // 1. Tenta recuperar qual cápsula estava sendo criada
      const pendingCapsuleId = localStorage.getItem('pending_capsule_id');

      // Se não veio código de pagamento
      if (!paymentId) {
        setStatus("Erro: Código de pagamento não encontrado.");
        setErrorMode(true);
        return;
      }

      // Se o navegador "esqueceu" qual era a cápsula (Troca de PC ou Localhost->Prod)
      if (!pendingCapsuleId) {
        setStatus("Não encontramos a cápsula pendente neste navegador.");
        setErrorMode(true);
        return;
      }

      try {
        setStatus("Vinculando pagamento à sua cápsula...");

        // 2. ATUALIZA NO BANCO
        const { error } = await supabase
          .from('capsules')
          .update({ order_id: paymentId })
          .eq('id', pendingCapsuleId);

        if (error) throw error;

        // 3. Limpa a memória e Redireciona
        localStorage.removeItem('pending_capsule_id');
        setStatus("Sucesso! Redirecionando...");
        setTimeout(() => navigate(`/v/${pendingCapsuleId}`), 1000);

      } catch (error) {
        console.error(error);
        setStatus("Erro ao validar. Entre em contato com o suporte.");
        setErrorMode(true);
      }
    }

    validate();
  }, [paymentId, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      
      {!errorMode ? (
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <Loader2 className="animate-spin text-purple-500 w-12 h-12" />
           <h2 className="text-xl font-bold">{status}</h2>
        </div>
      ) : (
        <div className="max-w-md bg-zinc-900 border border-red-500/30 p-8 rounded-2xl shadow-2xl">
           <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-500 w-8 h-8" />
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">Ops! Algo deu errado.</h2>
           <p className="text-zinc-400 mb-6">{status}</p>
           
           <div className="bg-black p-4 rounded-lg mb-6 text-left">
              <p className="text-xs text-zinc-500 mb-1">Seu código de pagamento:</p>
              <code className="text-green-400 font-mono text-sm">{paymentId}</code>
           </div>

           <p className="text-sm text-zinc-500 mb-6">
             Se você já pagou, não se preocupe! Sua cápsula está segura no sistema.<br/>
             Mande o código acima no suporte para liberarmos.
           </p>

           <button 
             onClick={() => navigate('/')} 
             className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition font-bold"
           >
             Voltar ao Início
           </button>
        </div>
      )}
    </div>
  );
}