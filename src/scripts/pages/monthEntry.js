import { supabase } from "@/lib/supabase";

// --- ELEMENTOS DE LA INTERFAZ ---
const buttonSave = document.getElementById('saveEntryMonth');
const indefiniteCheck = document.getElementById('Indefinite');

// Inputs principales
const nameConcept = document.getElementById('Concept');
const totalCashInput = document.getElementById('MonthTotal');
const monthCashInput = document.getElementById('MonthCash');
const dayPayMonth = document.getElementById('DateMonth');
const monthTime = document.getElementById('monthTime');

// Contenedores para efectos visuales
const creditWrapper = document.getElementById('creditWrapper');
const timeWrapper = document.getElementById('timeWrapper');
const payContainer = document.querySelector('.payContainer');

// Modales y Popups
const popupIcon = document.getElementById('openIconModal');
const popupAddPay = document.getElementById('openPayModal');
const modalIcon = document.getElementById('iconModal');
const modalAddPay = document.getElementById('addPayModal');
const closeModalIcon = document.getElementById('closeModalIcon');
const closeModalAddPay = document.getElementById('closeModalAddPay');
const iconOptions = document.querySelectorAll('.icon-option');

// Inputs del modal de pagos previos
const numberPayments = document.getElementById('RealizedPayments');
const realizedCredit = document.getElementById('RealizedCredit');
const buttonSaveModalAddPay = document.getElementById('saveModalAddPay');
const errorModal = document.getElementById('errorModal');

// --- 1. LÓGICA DE GASTO INDEFINIDO (UI) ---
indefiniteCheck?.addEventListener('change', (e) => {
    const isIndefinite = e.target.checked;
    
    if (isIndefinite) {
        creditWrapper.style.opacity = '0.3';
        creditWrapper.style.pointerEvents = 'none';
        timeWrapper.style.opacity = '0.3';
        timeWrapper.style.pointerEvents = 'none';
        payContainer.style.display = 'none';
        
        // Limpiamos valores que no tienen sentido en gasto indefinido
        totalCashInput.value = "";
        monthTime.value = "0";
    } else {
        creditWrapper.style.opacity = '1';
        creditWrapper.style.pointerEvents = 'all';
        timeWrapper.style.opacity = '1';
        timeWrapper.style.pointerEvents = 'all';
        payContainer.style.display = 'flex';
    }
});

// --- 2. LÓGICA DE PERIODOS AUTOMÁTICOS ---
dayPayMonth?.addEventListener('change', (e) => {
    const date = new Date(e.target.value);
    const day = date.getUTCDate();
    if (day <= 15) {
        document.getElementById('Period1').checked = true;
    } else {
        document.getElementById('Period2').checked = true;
    }
});

// --- 3. MANEJO DE MODALES ---
popupIcon?.addEventListener('click', (e) => {
    e.preventDefault();
    modalIcon.classList.add('active');
});

popupAddPay?.addEventListener('click', (e) => {
    e.preventDefault();
    modalAddPay.classList.add('active');
});

closeModalIcon?.addEventListener('click', () => modalIcon.classList.remove('active'));
closeModalAddPay?.addEventListener('click', () => modalAddPay.classList.remove('active'));

// Selección de Icono
iconOptions.forEach(option => {
    option.addEventListener('click', () => {
        const selectedName = option.getAttribute('data-icon');
        const selectedSvg = option.innerHTML;
        
        popupIcon.innerHTML = selectedSvg;
        popupIcon.setAttribute('data-selected', selectedName);
        modalIcon.classList.remove('active');
    });
});

// --- 4. VALIDACIÓN MODAL PAGOS PREVIOS ---
buttonSaveModalAddPay?.addEventListener('click', () => {
    if (indefiniteCheck.checked) {
        modalAddPay.classList.remove('active');
        return;
    }

    const totalActual = parseFloat(totalCashInput.value.replace(/[$,\s]/g, "")) || 0;
    const creditoRealizado = parseFloat(realizedCredit.value.replace(/[$,\s]/g, "")) || 0;
    const pagosTotales = parseInt(monthTime.value) || 0;
    const pagosHechos = parseInt(numberPayments.value) || 0;

    errorModal.textContent = "";

    if (pagosHechos > pagosTotales) {
        errorModal.textContent = "Pagos realizados no pueden superar el total.";
        return;
    }
    if (creditoRealizado > totalActual) {
        errorModal.textContent = "Monto no puede ser mayor al gasto total.";
        return;
    }
    
    modalAddPay.classList.remove('active');
});

// --- 5. GUARDAR EN SUPABASE ---
buttonSave?.addEventListener('click', async () => {
    const userId = window.currentUserId;
    const isIndefinite = indefiniteCheck.checked;
    const selectedPeriod = document.querySelector('input[name="period"]:checked')?.value;

    if (!userId) {
        alert("Sesión no encontrada. Intenta reingresar.");
        return;
    }

    // Limpiar formatos de moneda
    const cleanNum = (val) => parseFloat(val.replace(/[$,\s]/g, "")) || 0;

    const montoAbono = cleanNum(monthCashInput.value);
    const montoTotal = isIndefinite ? 0 : cleanNum(totalCashInput.value);
    const montoYaPagado = isIndefinite ? 0 : cleanNum(realizedCredit.value);
    const selectedIcon = popupIcon.getAttribute('data-selected') || 'Others';

    // Validaciones básicas
    if (!nameConcept.value) return alert("Escribe un concepto.");
    if (montoAbono <= 0) return alert("Ingresa un abono mensual válido.");
    if (!isIndefinite && montoTotal <= 0) return alert("Ingresa el crédito total.");

    try {
        buttonSave.disabled = true;
        buttonSave.textContent = "GUARDANDO...";

        const totalMeses = isIndefinite ? 999 : (parseInt(monthTime.value) || 0);
        const mesesPagados = isIndefinite ? 0 : (parseInt(numberPayments.value) || 0);

        const { error } = await supabase
            .from('FinanceEntryRegister')
            .insert({
                user_id: userId,
                nameEntry: nameConcept.value,
                registerDate: dayPayMonth.value || new Date().toISOString().split('T')[0],
                creditTotal: montoTotal,
                numberPayments: montoAbono, // Abono mensual
                paymentsMade: totalMeses, // Plazo total
                numberPaymentsMade: mesesPagados, // Avance
                remainingCredit: isIndefinite ? 0 : (montoTotal - montoYaPagado),
                remainingPayment: isIndefinite ? 999 : (totalMeses - mesesPagados),
                icon: selectedIcon,
                period: selectedPeriod,
                isIndefinite: indefiniteCheck.checked,
            });

        if (error) throw error;
        
        window.location.href = "/";
    } catch (err) {
        console.error("Error Supabase:", err);
        alert("Error al guardar el gasto.");
    } finally {
        buttonSave.disabled = false;
        buttonSave.textContent = "GUARDAR GASTO";
    }
});