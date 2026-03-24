import { supabase } from "@/lib/supabase"
import { money } from "@scripts/class/moneyManager";

const inc = document.querySelectorAll('input[name="income"]');
const periods = document.querySelectorAll('input[name="period"]');
const box = document.querySelector('.Period-select')
const button = document.getElementById('saveIncome')
const cashInput = document.getElementById('moneda');
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
    
    if (!userId) {
        alert("Error: No se detectó una sesión activa.");
        return;
    }

    const cleanValue = cashInput.value.replace(/[$,\s]/g, "");
    const montoIngresado = parseFloat(cleanValue);

    if (isNaN(montoIngresado) || montoIngresado <= 0) {
        alert("Por favor, ingresa un monto válido.");
        return;
    }

    try {
        button.disabled = true;
        button.textContent = "GUARDANDO...";

        const { data: currentFinance, error: fetchError } = await supabase
            .from('FinanceData')
            .select('global_amount')
            .eq('id', userId)
            .single();

        if (fetchError) throw fetchError;

        const nuevoTotal = (currentFinance?.global_amount || 0) + montoIngresado;
        const periodoActivo = document.querySelector('input[name="period"]:checked')?.value;

        const { data, error: updateError, status } = await supabase
            .from('FinanceData')
            .update({ 
                global_amount: nuevoTotal,
                date: dayPayInput.value || new Date().toISOString().split('T')[0],
                typeIncome: valuetarget === "1",
                period: valuetarget === "1" ? true : false
            })
            .eq('id', userId)
            .select();

        if (updateError) throw updateError;

        if (!data || data.length === 0) {
            throw new Error("No se pudo actualizar la fila. Verifica que el ID exista.");
        }

        alert(`¡Ingreso de ${money.format(montoIngresado)} guardado!`);
        window.location.href = "/";

    } catch (error) {
        console.error("Error completo:", error);
        alert("Error al guardar: " + error.message);
    } finally {
        button.disabled = false;
        button.textContent = "GUARDAR INGRESOS";
    }
});