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

const AUTH = firebase.auth();
AUTH.onAuthStateChanged(user => {
    if (user) 
        return window.location.href = "./profile";
});


// # DOM
const get = (selectorOrNode, selector) => {
    if (typeof selectorOrNode == "string")
        return document.querySelector(selectorOrNode);
    if (!selector)
        throw new Error("Expected two parameters when first parameter is not a string.");
    return selectorOrNode.querySelector(selector);
}

const locked = new Set();
const setButtonLock = (button, state) => {
    if (state) {
        locked.add(button)
        return button.setAttribute("disabled", true);
    }
        
    locked.delete(button);
    button.removeAttribute("disabled");
}
const isButtonLocked = (button) => locked.has(button);

const formBox = get(`main > section > div.right`);
const form = {
    nodes: {
        externals: {
            google: get(formBox, `div.externals > button[data-id="google"]`)
        },
        internal: {
            error: {
                box: get(formBox, `div.form > div.error`),
                msg: get(formBox, `div.form > div.error > p`)
            },
            inputs: {
                email: get(formBox, `div.form input[type="email"]`),
                password: get(formBox, `div.form input[type="password"]`)
            },
            buttons: {
                in: get(formBox, `div.form button.main`),
                up: get(formBox, `div.form button:not(.main)`)
            }
        }
    },
    hideError() {
        this.nodes.internal.error.box.classList.add("hidden");
    },
    showError(msg) {
        this.nodes.internal.error.box.classList.remove("hidden");
        this.nodes.internal.error.msg.innerText = `${msg}`.trim();
    },
    getInputs() {
        return {
            email: `${this.nodes.internal.inputs.email.value}`.trim(),
            password: `${this.nodes.internal.inputs.password.value}`.trim()
        }
    },
    getButton(name, func) {
        let out;
        switch(name) {
            case 'google':
                out = this.nodes.externals.google;
                break;
            case 'in':
                out = this.nodes.internal.buttons.in;
                break;
            case 'up':
                out = this.nodes.internal.buttons.up;
                break;
            default:
                out = document.createElement("button");
                break
        }

        if (!func || !(func instanceof Function))
            return out;

        func(out)
    }
}
form.hideError();
form.getButton("google", btn => {
    const provider = new firebase.auth.GoogleAuthProvider();
    btn.addEventListener("click", () => {
        if (isButtonLocked(btn))
            return

        const setAllButtons = state => {
            setButtonLock(btn, state)
            setButtonLock(form.getButton("in"), state)
            setButtonLock(form.getButton("up"), state)
        }

        setAllButtons(true);
        form.hideError();
        
        AUTH.signInWithPopup(provider)
            .then(() => setAllButtons(false))
            .catch(err => {
                form.showError(err.message || "Error occurred.");
                setAllButtons(false);
            });
    });
});

form.getButton("in", btn => {
    btn.addEventListener("click", () => {
        if (isButtonLocked(btn))
            return

        const setAllButtons = state => {
            setButtonLock(btn, state)
            setButtonLock(form.getButton("google"), state)
            setButtonLock(form.getButton("up"), state)
        }

        setAllButtons(true);
        form.hideError();

        const { email, password } = form.getInputs()
        AUTH.signInWithEmailAndPassword(email, password)
            .then(() => setAllButtons(false))
            .catch(err => {
                form.showError(err.message || "Error occurred.");
                setAllButtons(false);
            });
    });
});

form.getButton("up", btn => {
    btn.addEventListener("click", () => {
        if (isButtonLocked(btn))
            return

        const setAllButtons = state => {
            setButtonLock(btn, state)
            setButtonLock(form.getButton("google"), state)
            setButtonLock(form.getButton("in"), state)
        }

        setAllButtons(true);
        form.hideError();

        const { email, password } = form.getInputs()
        AUTH.createUserWithEmailAndPassword(email, password)
            .then(() => setAllButtons(false))
            .catch(err => {
                form.showError(err.message || "Error occurred.");
                setAllButtons(false);
            });
    });
});