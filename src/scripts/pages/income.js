const inc = document.querySelectorAll('input[name="income"]');
const periods = document.querySelectorAll('input[name="period"]');
const box = document.querySelector('.Period-select')
const button = document.getElementById('saveIncome')
const cashInput = document.getElementById('moneda');


const modifyBox = (opacity,pointerEvent) => {
    box.style.opacity = opacity;
    box.style.pointerEvents = pointerEvent
}

inc.forEach(income => {
    income.addEventListener('change', ev => {
        const target = ev.target
        if(target.checked && target.value === "2"){
            periods.forEach(period => {
                period.disable = true;
            })
            modifyBox("0.4","none")
            return
        }
        modifyBox("1","auto")
    })
})


