import { supabase } from "@/lib/supabase"

const inc = document.querySelectorAll('input[name="income"]');
const periods = document.querySelectorAll('input[name="period"]');
const box = document.querySelector('.Period-select')
const button = document.getElementById('saveIncome')
const cashInput = document.querySelector('.moneda');
const dayPayInput = document.querySelector('.InputDate');
let valuetarget = document.querySelector('input[name="income"]:checked')?.value || "1";

const modifyBox = (opacity, pointerEvent) => {
    box.style.opacity = opacity;
    box.style.pointerEvents = pointerEvent;
}

inc.forEach(income => {
    income.addEventListener('change', ev => {
        const target = ev.target;
        valuetarget = target.value;
        if (target.checked && target.value === "2") {
            periods.forEach(period => { period.disabled = true; });
            modifyBox("0.4", "none");
            return;
        }
        periods.forEach(period => { period.disabled = false; });
        modifyBox("1", "auto");
    });
});

button?.addEventListener('click', async () => {
    const userId = window.currentUserId;
    
    if (!userId) return;

    const cleanValue = cashInput.value.replace(/[$,\s]/g, "");
    const montoIngresado = parseFloat(cleanValue);

    if (isNaN(montoIngresado) || montoIngresado <= 0) return;

    try {
        button.disabled = true;
        button.textContent = "GUARDANDO...";

        const periodoActivo = document.querySelector('input[name="period"]:checked')?.value;
        
        const { error: registerError } = await supabase
            .from('FinanceIncomeRegister')
            .insert({
                user_id: userId,
                amount: montoIngresado,
                date: dayPayInput.value || new Date().toISOString().split('T')[0],
                is_fortnightly: valuetarget === "1",
                period: valuetarget === "1" ? (periodoActivo === "1" ? "Primero" : "Segundo") : "N/A"
            });

        if (registerError) throw new Error("Error al crear registro: " + registerError.message);

        const { data: allRegisters, error: sumError } = await supabase
            .from('FinanceIncomeRegister')
            .select('amount')
            .eq('user_id', userId);

        if (sumError) throw sumError;

        const nuevoTotalGlobal = allRegisters.reduce((acc, curr) => acc + curr.amount, 0);

        const { error: updateError } = await supabase
            .from('FinanceData')
            .update({ 
                global_amount: nuevoTotalGlobal,
                last_update: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        window.location.href = "/";

    } catch (error) {
        // console.error("Error completo:", error);
    } finally {
        button.disabled = false;
        button.textContent = "GUARDAR INGRESOS";
    }
});