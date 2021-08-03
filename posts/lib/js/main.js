// # FIREBASE
firebase.initializeApp({
    apiKey: "AIzaSyBJxja4Sd-os7iEiIOHpwtj0VgDtmUUO-0",
    authDomain: "cssi-2021-team-04.firebaseapp.com",
    projectId: "cssi-2021-team-04",
    storageBucket: "cssi-2021-team-04.appspot.com",
    messagingSenderId: "572149620254",
    appId: "1:572149620254:web:e4f78ac7128d8d713cd80f"
});


//#region Remove Contacts when move
let fixedClicked = false;

window.onresize = () => {
    if (window.innerWidth <= 1400){
        const ctx = document.getElementById('contacts');
        ctx.style.display = "none"
        let fixedContact = document.querySelector("#contactsFixed")
        let fixedBtn = document.querySelector("#contactsBtn")
        fixedContact.style.display = "block"
        fixedBtn.style.display = "grid"
    } else {
        const ctx = document.getElementById('contacts');
        ctx.style.display = "block"
        let fixedContact = document.querySelector("#contactsFixed")
        let fixedBtn = document.querySelector("#contactsBtn")
        fixedContact.style.display = "none"
        fixedBtn.style.display = "none"
    }
}

//Remove the fixed contacts
const ctx = document.querySelector("#contactsFixed");
ctx.style.display = "none"


//Contacts Btn Move fixed Contacts
const btn = document.querySelector("#contactsBtn");
btn.style.display = "none"
btn.addEventListener('click', function() {
    if (fixedClicked) {
        let ctx = document.querySelector("#contactsFixed");
        ctx.style.transition = "all ease-out 0.2s"
        ctx.style.transform = "translateX(100%)"
        btn.style.transform = "translateX(0%) rotate(0deg)"
        btn.style.transition = "all ease-out 0.2s"
    } else {
        let ctx = document.querySelector("#contactsFixed");
        ctx.style.transition = "all ease-out 0.2s"
        ctx.style.transform = "translateX(0%)"
        btn.style.transform = "translateX(-600%) rotate(180deg)"
        btn.style.transition = "all ease-out 0.2s"
    }
    fixedClicked = !fixedClicked 
})

//#endregion



//#region Check if it's phone

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    // true for mobile device
    const ctx = document.getElementById('contacts');
    ctx.style.display = "none"
}

//#endregion