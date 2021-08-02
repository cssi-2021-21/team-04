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

const activities = [
    "run",
    "treadmill",
    "hiking",
    "weight",
    "cycling",
    "elliptical",
    "spinning",
    "yoga",
    "stair-climber",
    "circuit-training",
    "bootcamp",
    "pilates",
    "kickboxing",
    "tennis",
    "martial-arts",
    "golf",
    "walk",
    "workout",
    "swim",
];

activities.forEach(e=>{
    let optionEx = document.createElement("option");
    optionEx.value = e;
    optionEx.text = e.charAt(0).toUpperCase() + e.substr(1).toLowerCase();
    document.querySelector("#exercise").appendChild(optionEx);
})

