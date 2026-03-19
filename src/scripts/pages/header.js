

const popup = document.querySelector(".popup");
const signInButton = document.querySelector(".Signin")
const logoImage = document.querySelector("#home")


signInButton.addEventListener( "click", ()=>{
    const state = popup.classList.contains("active")
    state ? popup.classList.remove("active") : popup.classList.add("active")
})

logoImage.addEventListener( "click" , ()=> {
    window.location.replace("/")
})