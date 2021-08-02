console.log("script running.");

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
window.onresize = () => {
    if (window.innerWidth <= 1100){
        const ctx = document.getElementById('contacts');
        ctx.style.display = "none"
    } else {
        const ctx = document.getElementById('contacts');
        ctx.style.display = "block"
    }
}

//#endregion

//#region Check if it's phone

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    // true for mobile device
    
}

//#endregion