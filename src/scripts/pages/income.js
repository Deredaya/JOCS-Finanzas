const inputMoneda = document.getElementById('moneda');

inputMoneda.addEventListener('input', (e) => {
  let valor = e.target.value.replace(/\D/g, "");

  valor = (valor / 100).toFixed(2);

  if (isNaN(valor)) {
    e.target.value = "";
  } else {
    e.target.value = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  }
});