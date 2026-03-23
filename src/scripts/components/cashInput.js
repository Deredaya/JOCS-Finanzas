import { money } from "@scripts/class/moneyManager";

const cashInput = document.getElementById('moneda');

cashInput.addEventListener('input', ev => {
  const cursor = ev.target.selectionStart
  let value = ev.target.value
  const dotIndex = value.indexOf(".")+1

  const setCursor = (index) => {
    setTimeout(() => {
      ev.target.setSelectionRange(index,index)
    },0)
  }

  if(!value.includes("..") && value.endsWith(".00") || !value.includes(".")){
    let current = value.replace(/\D/g,"");
    if(value.includes(".00")|| (!value.includes(".") && value.length > 2)) current = current.slice(0,-2);
  
    let number = parseFloat(current) || 0;
    const result = money.format(number)
    ev.target.value = result;
  
    setCursor(result.indexOf("."))
    return
  }

  if(value.includes("..")){
    const parts = value.split(".");
    const intNumber = parseInt(parts[0].replace(/\D/g, "")) || 0;
    const formatedValue = money.format(intNumber);
    ev.target.value = formatedValue
    
    setCursor(dotIndex)
    return
  }
  
  else{
    const parts = value.split(".");
    const intNumber = parseInt(parts[0].replace(/\D/g, "")) || 0;
    const formatedValue = money.format(intNumber + parseFloat("0."+parts[1]?.substring(0,2)||"0"));
    ev.target.value = formatedValue
    
    setCursor(cursor)
  }
});

cashInput.addEventListener('beforeinput', ev => {
  const value = ev.target.value.replace(/\D/g,"")
  const dotIndex = value.indexOf(".") == -1 ? 10 : value.indexOf(".")
  const cursor = ev.target.selectionStart
  if(cursor > dotIndex || ev.data == null) return
  if(value.length >= 9 && ev.data !== ".") return ev.preventDefault()
})