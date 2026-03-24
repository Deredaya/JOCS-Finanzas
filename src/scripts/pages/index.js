import { supabase } from "@/lib/supabase"
import { money } from "@scripts/class/moneyManager";

async function cargarSaldo() {
  const userId = window.currentUserId;

  console.log("Cargando datos para el usuario:", userId);

  const { data: FinanceData, error } = await supabase
      .from('FinanceData')
      .select('global_amount')
      .eq('id', userId)
      .single();

  if (error) {
      console.error("Error de Supabase:", error.message);
      return;
  }

  const element = document.querySelector(".cash");
  if (element && FinanceData) {
      console.log("Monto recibido:", FinanceData.global_amount);
      element.textContent = `${money.format(FinanceData.global_amount)}`;
  }
}

cargarSaldo();