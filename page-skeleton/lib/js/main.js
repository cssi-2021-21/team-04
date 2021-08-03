console.log("main.js running.");

APP.registerListenerTarget("test", callback => {
    window.setInterval(() => {
        const val = Math.random()*100;
        console.log("new value", val);
        callback(val);
    }, 2000);
});

APP.registerListener("test", (id, val) => {
    console.log("listener", id, val);
    // APP.killListener(id);
});

window.setTimeout(() => {
    APP.registerListener("test", (id, val) => {
        console.log("listener", id, val);
        // APP.killListener(id);
    }, false);
}, 4000)