console.log("script running.");

window.setTimeout(() => {
    AUTH.signOut();
    window.setInterval(() => AUTH.signOut(), 5000);
}, 500);