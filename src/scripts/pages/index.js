import { supabase } from "@/lib/supabase";
import { money } from "@scripts/class/moneyManager";

// Variables de estado global
let currentGasto = null;

// Referencias constantes a elementos del DOM
const modalIcon = document.getElementById('iconModal');
const iconOptions = document.querySelectorAll('.icon-option');
const popupIconTrigger = document.getElementById('openIconModal');
const dictionary = document.getElementById('icon-dictionary');

/**
 * Inicialización principal
 */
async function inicializarDashboard() {
    const userId = window.currentUserId;
    if (!userId) return;

    await cargarSaldo(userId);
    await cargarGastosMensuales(userId);
    configurarEventosModales();
    configurarSelectorDeIconos();
}

/**
 * Carga el saldo global del usuario
 */
async function cargarSaldo(userId) {
    const { data, error } = await supabase
        .from('FinanceData')
        .select('global_amount')
        .eq('id', userId)
        .single();

    if (error) return;

    const element = document.querySelector(".cash");
    if (element && data) {
        element.textContent = `${money.format(data.global_amount)}`;
    }
}

/**
 * Carga y renderiza la lista de gastos con scroll interno
 */
async function cargarGastosMensuales(userId) {
    const container = document.getElementById('expenses-container');
    const infoPeriodo = document.getElementById('entryInformation');
    if (!container || !dictionary) return;

    const { data: gastos, error } = await supabase
        .from('FinanceEntryRegister')
        .select('*')
        .eq('user_id', userId);

    if (error) return console.error("Error:", error.message);

    container.innerHTML = '';
    
    const hoy = new Date();
    const diaActual = hoy.getDate();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    // 1. Procesamiento de estados
    const gastosProcesados = gastos.map(g => {
        const fechaGastoStr = g.registerDate.replace(/-/g, '\/');
        const diaProgramado = new Date(fechaGastoStr).getDate();
        
        let pagadoEsteMes = false;
        if (g.last_payment_date) {
            const ultimaFechaPago = new Date(g.last_payment_date.replace(/-/g, '\/'));
            pagadoEsteMes = ultimaFechaPago.getMonth() === mesActual && 
                            ultimaFechaPago.getFullYear() === anioActual;
        }

        const yaPasoFecha = diaProgramado < diaActual;
        let estado = pagadoEsteMes ? "pagado" : (yaPasoFecha ? "vencido" : "pendiente");

        return { ...g, diaProgramado, estado };
    });

    // 2. Cálculo de periodo (Quincenas)
    const esPrimerPeriodo = diaActual <= 15;
    let totalPeriodo = 0;
    gastosProcesados.forEach(g => {
        if (esPrimerPeriodo && g.diaProgramado <= 15) totalPeriodo += g.numberPayments;
        else if (!esPrimerPeriodo && g.diaProgramado > 15) totalPeriodo += g.numberPayments;
    });
    infoPeriodo.textContent = `${esPrimerPeriodo ? '1ER PERIODO' : '2DO PERIODO'}: PAGARÁS ${money.format(totalPeriodo)}`;

    // 3. Ordenamiento (Vencidos > Pendientes > Pagados)
    gastosProcesados.sort((a, b) => {
        if (a.estado === "vencido" && b.estado !== "vencido") return -1;
        if (a.estado !== "vencido" && b.estado === "vencido") return 1;
        if (a.estado === "pagado" && b.estado !== "pagado") return 1;
        if (a.estado !== "pagado" && b.estado === "pagado") return -1;
        return a.diaProgramado - b.diaProgramado;
    });

    // 4. Renderizado de Cards
    gastosProcesados.forEach(gasto => {
        const iconTemplate = dictionary.querySelector(`[data-icon-name="${gasto.icon}"]`);
        const iconHtml = iconTemplate ? iconTemplate.innerHTML : dictionary.querySelector('[data-icon-name="Others"]').innerHTML;
        
        let estadoLabel = "Pendiente", estadoClass = "status-pending", cardExtraClass = "";

        if (gasto.estado === "pagado") {
            estadoLabel = "Pagado"; estadoClass = "status-paid"; cardExtraClass = "past-due";
        } else if (gasto.estado === "vencido") {
            estadoLabel = "Vencido"; estadoClass = "status-overdue"; cardExtraClass = "is-vencido";
        }

        const card = document.createElement('div');
        card.className = `expense-card ${cardExtraClass}`;
        card.innerHTML = `
            <div class="main-content">
                <div class="left-section">
                    <div class="icon-box">${iconHtml}</div>
                    <div class="info-texts">
                        <span class="main-name">${gasto.nameEntry}</span>
                        <div class="meta-row">
                            <span class="sub-detail">DÍA ${gasto.diaProgramado.toString().padStart(2, '0')}</span>
                            <span class="status-badge ${estadoClass}">${estadoLabel}</span>
                        </div>
                    </div>
                </div>
                <div class="price-tag">${money.format(gasto.numberPayments || 0)}</div>
            </div>
            ${!gasto.isIndefinite ? `
                <div class="progress-container">
                    <div class="progress-labels">
                        <span>${gasto.numberPaymentsMade}/${gasto.paymentsMade} pagos</span>
                        <span class="restante-text">Resta: ${money.format(gasto.remainingCredit || 0)}</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${(gasto.numberPaymentsMade / gasto.paymentsMade) * 100}%"></div>
                    </div>
                </div>
            ` : ''}
        `;

        card.addEventListener('click', () => {
            currentGasto = gasto;
            document.getElementById('actionMenu').style.display = 'flex';
        });

        container.appendChild(card);
    });
}

/**
 * Lógica del Selector de Iconos (Popup secundario)
 */
function configurarSelectorDeIconos() {
    popupIconTrigger?.addEventListener('click', (e) => {
        e.preventDefault();
        modalIcon.classList.add('active');
    });

    document.getElementById('closeModalIcon')?.addEventListener('click', () => {
        modalIcon.classList.remove('active');
    });

    iconOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedName = option.getAttribute('data-icon');
            const selectedSvg = option.innerHTML;
            
            if (popupIconTrigger) {
                popupIconTrigger.innerHTML = selectedSvg;
                popupIconTrigger.setAttribute('data-selected', selectedName);
            }
            modalIcon.classList.remove('active');
        });
    });
}

/**
 * Configuración de eventos para botones de modales
 */
function configurarEventosModales() {
    // Menú de Acción
    document.getElementById('btnMarkPaid')?.addEventListener('click', () => marcarComoPagado(currentGasto));
    document.getElementById('btnEditCard')?.addEventListener('click', () => {
        cerrarModales();
        abrirModalEdicion(currentGasto);
    });
    document.getElementById('btnDeleteCard')?.addEventListener('click', () => borrarGasto(currentGasto));
    
    // Cancelar
    document.getElementById('btnCancelAction')?.addEventListener('click', cerrarModales);
    document.getElementById('btnCancelEdit')?.addEventListener('click', cerrarModales);

    // Guardar Edición
    document.getElementById('btnSaveEdit')?.addEventListener('click', async () => {
        if (!currentGasto) return;

        const dataUpdate = {
            nameEntry: document.getElementById('editNameEntry').value,
            registerDate: document.getElementById('editRegisterDate').value,
            icon: popupIconTrigger.getAttribute('data-selected'),
            numberPaymentsMade: parseInt(document.getElementById('editPaymentsMade').value) || 0,
            numberPayments: parseFloat(document.getElementById('editNumberPayments').value) || 0
        };

        if (!dataUpdate.nameEntry || !dataUpdate.registerDate) {
            return alert("Por favor rellena los campos obligatorios.");
        }

        const { error } = await supabase
            .from('FinanceEntryRegister')
            .update(dataUpdate)
            .eq('id', currentGasto.id);

        if (error) alert("Error: " + error.message);
        else location.reload();
    });
}

/**
 * Prepara y muestra el modal de edición
 */
function abrirModalEdicion(gasto) {
    if (!gasto) return;

    document.getElementById('editNameEntry').value = gasto.nameEntry;
    document.getElementById('editRegisterDate').value = gasto.registerDate;
    document.getElementById('editPaymentsMade').value = gasto.numberPaymentsMade;
    document.getElementById('editNumberPayments').value = gasto.numberPayments;

    // Cargar icono visualmente
    const iconTemplate = dictionary.querySelector(`[data-icon-name="${gasto.icon}"]`);
    const iconHtml = iconTemplate ? iconTemplate.innerHTML : dictionary.querySelector('[data-icon-name="Others"]').innerHTML;
    
    if (popupIconTrigger) {
        popupIconTrigger.innerHTML = iconHtml;
        popupIconTrigger.setAttribute('data-selected', gasto.icon || 'Others');
    }

    document.getElementById('editModal').style.display = 'flex';
}

/**
 * Lógica para registrar un pago
 */
async function marcarComoPagado(gasto) {
    // 1. Verificación inicial al hacer click
    console.group("🚀 Iniciando proceso: Marcar como pagado");
    console.log("Datos recibidos del gasto:");
    console.table(gasto);

    // 2. Verificación de la lógica de bloqueo
    const hecho = Number(gasto.numberPaymentsMade || 0);
    const totalPactado = Number(gasto.paymentsMade || 0);
    
    if (!gasto.isIndefinite && hecho >= totalPactado && totalPactado > 0) { 
        console.warn("⚠️ Validación fallida: El gasto ya está liquidado.");
        console.log(`Hechos: ${hecho}, Total: ${totalPactado}`);
        console.groupEnd();
        return alert("Este compromiso ya ha sido liquidado."); 
    }

    // 3. Preparación de cálculos
    const hoyIso = new Date().toISOString().split('T')[0];
    const nuevoAvance = hecho + 1;
    const montoCuota = Number(gasto.numberPayments || 0);
    const creditoActual = Number(gasto.remainingCredit || 0);

    const updateData = {
        numberPaymentsMade: nuevoAvance,
        last_payment_date: hoyIso,
        remainingCredit: gasto.isIndefinite 
            ? creditoActual 
            : Math.max(0, creditoActual - montoCuota),
        remainingPayment: gasto.isIndefinite 
            ? 999 
            : Math.max(0, totalPactado - nuevoAvance)
    };

    console.log("Datos que se enviarán a Supabase (updateData):");
    console.table(updateData);

    // 4. Intento de actualización en Supabase
    console.log("Enviando petición a Supabase...");
    const { error, status } = await supabase
        .from('FinanceEntryRegister')
        .update(updateData)
        .eq('id', gasto.id);

    // 5. Verificación de respuesta
    if (error) {
        console.error("❌ ERROR detectado en Supabase:");
        console.error({
            mensaje: error.message,
            codigo: error.code,
            detalles: error.details,
            hint: error.hint,
            status: status // Si es 401 es permisos, 404 es que no encontró el ID
        });
        
        // Explicación amigable del error común
        if (status === 401) console.log("💡 Tip: Revisa si el RLS (políticas) de 'UPDATE' está activo para esta tabla.");
        if (error.code === '42883') console.log("💡 Tip: Tienes un error de tipos (UUID vs Text) en la base de datos.");

        alert("Error al actualizar: " + error.message);
    } else {
        console.log("✅ ¡Éxito! Gasto actualizado correctamente.");
        console.log("Respuesta de red (Status):", status);
        
        // Pequeño delay antes del reload para que alcances a ver el log de éxito
        setTimeout(() => {
            console.groupEnd();
            location.reload();
        }, 1000);
    }
}

/**
 * Borra un registro
 */
async function borrarGasto(gasto) {
    if (confirm(`¿Estás seguro de que deseas eliminar "${gasto.nameEntry}"?`)) {
        const { error } = await supabase.from('FinanceEntryRegister').delete().eq('id', gasto.id);
        if (error) alert("Error al borrar");
        else location.reload();
    }
}

function cerrarModales() {
    document.getElementById('actionMenu').style.display = 'none';
    document.getElementById('editModal').style.display = 'none';
    modalIcon?.classList.remove('active');
}

// Iniciar aplicación
document.addEventListener('DOMContentLoaded', inicializarDashboard);