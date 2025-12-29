import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function ValidatePayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Validando pagamento...");

  // A Kirvano manda o ID da transação na URL (geralmente ?ref=... ou ?id=...)
  const paymentId = searchParams.get('ref') || searchParams.get('id');

  useEffect(() => {
    async function validate() {
      // 1. Pega o ID da cápsula que salvamos no navegador antes de ir pagar
      const pendingCapsuleId = localStorage.getItem('pending_capsule_id');

      if (!paymentId) {
        setStatus("Erro: Pagamento não identificado.");
        return;
      }

      if (!pendingCapsuleId) {
        // Se perdeu o ID local, tenta achar pelo paymentId se já foi processado antes
        // Ou manda pra home
        setStatus("Erro: Sessão expirada.");
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        // 2. ATUALIZA A CÁPSULA: Troca "PENDING_..." pelo ID REAL do Pagamento
        // Isso "oficializa" a cápsula
        const { error } = await supabase
          .from('capsules')
          .update({ order_id: paymentId })
          .eq('id', pendingCapsuleId);

        if (error) throw error;

        // 3. Limpa o navegador
        localStorage.removeItem('pending_capsule_id');

        // 4. Sucesso!
        navigate(`/v/${pendingCapsuleId}`);

      } catch (error) {
        console.error(error);
        setStatus("Erro ao validar cápsula. Entre em contato com o suporte.");
      }
    }

    validate();
  }, [paymentId, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-purple-500 w-10 h-10" />
      <p>{status}</p>
    </div>
  );
}