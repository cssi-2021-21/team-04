console.log("script running.");

// # FIREBASE
firebase.initializeApp({
    apiKey: "AIzaSyAfKeoAG7eiRzWQlKtyG_1mrb375wclXW8",
    authDomain: "cssi-2021-21-team-04.firebaseapp.com",
    projectId: "cssi-2021-21-team-04",
    storageBucket: "cssi-2021-21-team-04.appspot.com",
    messagingSenderId: "691973782453",
    appId: "1:691973782453:web:f2748f5aa67bdbd35ff7fc"
});


// Stylize with Animate.css 
/*
    document.documentElement.style.setProperty('--animate-duration', '.5s');
*/
const notesRef = firebase.database().ref();
    notesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log(data);
});