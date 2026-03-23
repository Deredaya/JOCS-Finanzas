import { supabase } from "@/lib/supabase"
import { CurrencyDataTypes, money } from "@scripts/class/moneyManager";

let { data: FinanceData, error } = await supabase
  .from('FinanceData')
  .select('*')
          
const element = document.querySelector(".cash")
element.textContent = `${money.format(FinanceData[0].global_amount)}`