class CookieManagerClass {

    setCookie(name, value, hours) {
        const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
    }
    
    getCookie(name) {
        let cookies = document.cookie.split("; ");
        for (let c of cookies) {
            let [key, value] = c.split("=");
            if (key === name) return value;
        }
        return null;
    }
}
const cookieManager = new CookieManagerClass();

const cookieSubEvents = []
setInterval(()=> {
    cookieSubEvents.forEach(cookieSub => {
        const cookie = Object.entries(cookieSub);
        if(cookieManager.getCookie(cookie[0][0]) == cookie[0][1]) return;
        cookieSub[cookie[0][0]] = cookieManager.getCookie(cookie[0][0])
        cookie[1][1]();
    })
},500)


export class cookieChangeEventClass {
    constructor(cookie){
        this.cookie = cookie
    }
    subscribe(func){
        const cookieEvent = {}
        cookieEvent[this.cookie] = cookieManager.getCookie(this.cookie)
        cookieEvent["function"] = func;
        cookieSubEvents.push(cookieEvent)
    }
}

export default cookieManager;