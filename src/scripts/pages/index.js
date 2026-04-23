import { supabase } from "@/lib/supabase";
import { money } from "@scripts/class/moneyManager";

/**
 * Función principal que coordina la carga del saldo y los gastos
 */
async function inicializarDashboard() {
    const userId = window.currentUserId;

    if (!userId) {
        console.warn("No se detectó userId en el cliente.");
        return;
    }

    // Ejecutamos ambas cargas
    await cargarSaldo(userId);
    await cargarGastosMensuales(userId);
}

/**
 * Obtiene el saldo global desde FinanceData
 */
async function cargarSaldo(userId) {
    const { data, error } = await supabase
        .from('FinanceData')
        .select('global_amount')
        .eq('id', userId)
        .single();

    if (error) return console.error("Error al obtener saldo:", error.message);

    const element = document.querySelector(".cash");
    if (element && data) {
        element.textContent = `${money.format(data.global_amount)}`;
    }
}

/**
 * IMPORTACIÓN DE GASTOS: 
 * Ahora genera CARDS dinámicas en lugar de llenar columnas de tabla.
 */
async function cargarGastosMensuales(userId) {
    const container = document.getElementById('expenses-container');
    const dictionary = document.getElementById('icon-dictionary');

    if (!container || !dictionary) return;

    // Consulta a la tabla según la estructura que compartiste
    const { data: gastos, error } = await supabase
        .from('FinanceEntryRegister')
        .select('*')
        .eq('user_id', userId)
        .order('registerDate', { ascending: false }); 

    if (error) {
        console.error("Error al importar gastos:", error.message);
        return;
    }

    // Limpiar el loader inicial
    container.innerHTML = '';

    if (!gastos || gastos.length === 0) {
        container.innerHTML = '<p class="loader">No hay movimientos registrados.</p>';
        return;
    }

    // Insertar cada registro como una tarjeta (Card)
    gastos.forEach(gasto => {
        // 1. Obtener el icono del diccionario oculto
        const iconTemplate = dictionary.querySelector(`[data-icon-name="${gasto.icon}"]`);
        const iconHtml = iconTemplate 
            ? iconTemplate.innerHTML 
            : dictionary.querySelector('[data-icon-name="Others"]').innerHTML;

        // 2. Formatear Fecha (ej: 23 ABR)
        const fechaObj = new Date(gasto.registerDate);
        const dia = fechaObj.getDate().toString().padStart(2, '0');
        const mes = fechaObj.toLocaleString('es-MX', { month: 'short' }).toUpperCase().replace('.', '');
        
        // 3. Crear el progreso de pagos (ej: 2/12)
        const pagos = `${gasto.numberPaymentsMade || 0}/${gasto.numberPayments || 0}`;

        // 4. Crear la estructura de la tarjeta
        const card = document.createElement('div');
        card.className = 'expense-card';
        
        card.innerHTML = `
            <div class="left-section">
                <div class="icon-box">
                    ${iconHtml}
                </div>
                <div class="info-texts">
                    <span class="main-name">${gasto.nameEntry}</span>
                    <span class="sub-detail">PAGO ${dia} ${mes}</span>
                </div>
            </div>
            <div class="price-tag">
                ${money.format(gasto.creditTotal)}
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarDashboard);