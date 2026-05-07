import { supabase } from "@/lib/supabase";
import { money } from "@scripts/class/moneyManager";

// --- REFERENCIAS ---
const tableData = document.getElementById('tableData');
const btnAddExpense = document.getElementById('btnAddDailyExpense');
const inputMonto = document.getElementById('dailyAmountInput');
const dictionary = document.getElementById('icon-dictionary');
const btnViewAll = document.getElementById('btnViewAll');

let mostrarTodos = false;

function inicializar() {
    // Leemos la variable que Astro inyectó
    const userId = window.currentUserId;

    if (!userId) {
        console.error("Error: No se recibió el userId desde Astro.");
        return;
    }

    console.log("Iniciando con userId:", userId);
    
    // Configurar eventos
    configurarEventos(userId);
    
    // Cargar datos iniciales
    cargarMovimientos(userId);
}

function configurarEventos(userId) {
    // Agregar Gasto
    btnAddExpense?.addEventListener('click', async (e) => {
        e.preventDefault();
        await registrarGasto(userId);
    });

    // Ver Todo
    btnViewAll?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarTodos = !mostrarTodos;
        btnViewAll.textContent = mostrarTodos ? "Ver menos" : "Ver todo";
        cargarMovimientos(userId);
    });
}

async function registrarGasto(userId) {
    const montoRaw = inputMonto.value.replace(/[^0-9.-]+/g, "");
    const monto = parseFloat(montoRaw);
    
    const radioSelected = document.querySelector('input[name="cat"]:checked');
    if (!radioSelected) return alert("Selecciona una categoría.");
    const categoriaNombre = radioSelected.getAttribute('data-name');

    if (isNaN(monto) || monto <= 0) return alert("Monto no válido.");

    // 1. Obtener saldo de FinanceData
    const { data: financeRow, error: fetchError } = await supabase
        .from('FinanceData')
        .select('global_amount')
        .eq('id', userId)
        .single();

    if (fetchError || !financeRow) return alert("Error al consultar saldo.");
    if (financeRow.global_amount < monto) return alert("Saldo insuficiente.");

    // 2. Insertar en FinanceDailyEntryRegister
    const { error: insertError } = await supabase
        .from('FinanceDailyEntryRegister')
        .insert([{ 
            user_id: userId, 
            credit: monto, 
            category: categoriaNombre, 
            date: new Date().toISOString().split('T')[0] 
        }]);

    if (insertError) return alert("Error al registrar movimiento.");

    // 3. Actualizar FinanceData
    const nuevoSaldo = financeRow.global_amount - monto;
    const { error: updateError } = await supabase
        .from('FinanceData')
        .update({ global_amount: nuevoSaldo })
        .eq('id', userId);

    if (updateError) {
        alert("Error al actualizar saldo global.");
    } else {
        inputMonto.value = "";
        alert("¡Gasto agregado!");
        location.reload(); 
    }
}

async function cargarMovimientos(userId) {
    let query = supabase
        .from('FinanceDailyEntryRegister')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (!mostrarTodos) query = query.limit(5);

    const { data: movimientos, error } = await query;
    if (error) return;

    tableData.innerHTML = '';
    movimientos.forEach(mov => {
        const iconMap = { "Comida": "1", "Transporte": "2", "Negocio": "3", "Otros": "4" };
        const iconId = iconMap[mov.category] || "4";
        const iconHtml = dictionary.querySelector(`[data-icon-id="${iconId}"]`).innerHTML;
        const [y, m, d] = mov.date.split('-');

        const card = document.createElement('div');
        card.className = 'daily-move-card';
        card.innerHTML = `
            <div class="move-info">
                <div class="move-icon">${iconHtml}</div>
                <div class="move-texts">
                    <span class="cat-name">${mov.category}</span>
                    <span class="move-date">${d}/${m}</span>
                </div>
            </div>
            <div class="move-amount">-${money.format(mov.credit)}</div>
        `;
        tableData.appendChild(card);
    });
}

// Ejecutar al cargar
inicializar();