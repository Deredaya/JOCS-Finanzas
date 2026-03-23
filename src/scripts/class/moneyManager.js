class MoneyManagerClass {
    #formater = function (currency = `MXN`,locale = `es-MX`){
        return new Intl.NumberFormat(`${locale}`, {
            style: 'currency',
            currency: `${currency}`,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
    });
    }

    /**
     * 
     * @param {Number} value 
     * @param {CurrencyDataTypes} type 
     * @returns 
     */
    format(value, type){
        return this.#formater(type).format(value)
    }
}

export const money = new MoneyManagerClass();


export class CurrencyDataTypes {
    get mxn(){ return [`MXN`,`es-MX`]}
    get usd(){ return [`USD`,`en-US`]}
}