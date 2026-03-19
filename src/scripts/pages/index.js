import { supabase } from "@/lib/supabase"

let { data: FinanceData, error } = await supabase
  .from('FinanceData')
  .select('*')
          
const element = document.querySelector(".cash")
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
element.textContent = `${formatter.format(FinanceData[0].global_amount)}`