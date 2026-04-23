import { supabase } from "@/lib/supabase";

// Elementos de la interfaz
const button = document.getElementById('saveEntryMonth');
const buttonPopupAddPay = document.getElementById('saveModalAddPay');
const monthCashInput = document.getElementById('MonthCash');
const totalCashInput = document.getElementById('MonthTotal');
const nameConcept = document.getElementById('Concept');
const dayPayMonth = document.getElementById('DateMonth');
const monthTime = document.getElementById('monthTime');
const numberPayments = document.getElementById('RealizedPayments');
const realizedCredit = document.getElementById('RealizedCredit');
const errorModal = document.getElementById('errorModal');

const popupIcon = document.querySelector('.popupIcons');
const popupAddPay = document.querySelector('.addPay');

const modalIcon = document.getElementById('iconModal');
const modalAddPay = document.getElementById('addPayModal');
const closeModalIcon = document.getElementById('closeModalIcon');
const closeModalAddPay = document.getElementById('closeModalAddPay');

const iconOptions = document.querySelectorAll('.icon-option');

// --- LÓGICA DE MODALES ---
popupIcon?.addEventListener('click', (e) => {
    e.preventDefault();
    modalIcon.classList.add('active');
});

popupAddPay?.addEventListener('click', (e) => {
    e.preventDefault();
    modalAddPay.classList.add('active');
});

closeModalIcon?.addEventListener('click', () => { modalIcon.classList.remove('active'); });
closeModalAddPay?.addEventListener('click', () => { modalAddPay.classList.remove('active'); });

// --- SELECCIÓN DE ICONO ---
iconOptions.forEach(option => {
    option.addEventListener('click', () => {
        const selectedName = option.getAttribute('data-icon');
        const selectedSvg = option.innerHTML;
        
        popupIcon.innerHTML = selectedSvg;
        popupIcon.setAttribute('data-selected', selectedName);
        modalIcon.classList.remove('active');
    });
});

// --- GUARDAR GASTO PRINCIPAL ---
button?.addEventListener('click', async () => {
    const userId = window.currentUserId;
    console.log("ID que se intenta enviar:", userId); // <-- REVISA ESTO EN LA CONSOLA DEL NAVEGADOR

    if (!userId) {
        console.error("No hay una sesión activa de Auth-Astro");
        return;
    }
    if (!userId) return;

    const clsMonth = monthCashInput.value.replace(/[$,\s]/g, "");
    const clsTotal = totalCashInput.value.replace(/[$,\s]/g, "");
    const clsRealized = realizedCredit.value.replace(/[$,\s]/g, "");

    const montoMonth = parseFloat(clsMonth) || 0;
    const montoTotal = parseFloat(clsTotal) || 0;
    const montoRealizado = parseFloat(clsRealized) || 0;

    const selectedIcon = popupIcon.getAttribute('data-selected') || 'Others';

    if (isNaN(montoMonth) || montoMonth <= 0 || isNaN(montoTotal) || montoTotal <= 0) {
        alert("Ingresa montos válidos");
        return;
    }

    try {
        button.disabled = true;
        button.textContent = "Guardando...";

        const { error: registerError } = await supabase
        .from('FinanceEntryRegister')
        .insert({
            user_id: userId,
            nameEntry: nameConcept.value,
            registerDate: dayPayMonth.value || new Date().toISOString().split('T')[0],
            creditTotal: montoTotal,
            numberPayments: montoMonth,
            paymentsMade: parseInt(monthTime.value) || 0,
            numberPaymentsMade: parseInt(numberPayments.value) || 0,
            remainingCredit: montoTotal - montoRealizado,
            remainingPayment: (parseInt(monthTime.value) || 0) - (parseInt(numberPayments.value) || 0),
            icon: selectedIcon
        });

        if (registerError) throw registerError;
        
        window.location.href = "/";
    } catch (error) {
        console.error("Error completo:", error);
        alert("Error al guardar: " + (error.message || error));
    } finally {
        button.disabled = false;
        button.textContent = "GUARDAR GASTO";
    }
});

// --- VALIDACIÓN DEL POPUP DE PAGOS ---
buttonPopupAddPay?.addEventListener('click', () => {
    const totalActual = parseFloat(totalCashInput.value.replace(/[$,\s]/g, "")) || 0;
    const creditoRealizado = parseFloat(realizedCredit.value.replace(/[$,\s]/g, "")) || 0;
    
    const pagosTotales = parseInt(monthTime.value) || 0;
    const pagosHechos = parseInt(numberPayments.value) || 0;

    errorModal.textContent = "";

    if (pagosHechos > pagosTotales) {
        errorModal.textContent = "El número de pagos realizados no puede ser mayor al total.";
        return;
    }

    if (creditoRealizado > totalActual) {
        errorModal.textContent = "El monto registrado no puede ser mayor que su gasto total.";
        return;
    }
    
    modalAddPay.classList.remove('active');
});