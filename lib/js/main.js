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
    getButtons() {
        return {
            google: this.nodes.externals.google,
            in: this.nodes.internal.buttons.in,
            up: this.nodes.internal.buttons.up
        }
    },
    getButton(name, func) {
        let out = this.getButtons()[name]
        if (!func || !(func instanceof Function))
            return out;

        func(out)
    },
    setAllButtonsLock(state) {
        const BTNS = Object.values(this.getButtons())
        for (const btn of BTNS)
            setButtonLock(btn, state)
    }
}
form.hideError();
form.getButton("google", btn => {
    const provider = new firebase.auth.GoogleAuthProvider();
    btn.addEventListener("click", () => {
        if (isButtonLocked(btn))
            return

        form.setAllButtonsLock(true);
        form.hideError();
        
        AUTH.signInWithPopup(provider)
            .then(() => form.setAllButtonsLock(false))
            .catch(err => {
                form.showError(err.message || "Error occurred.");
                form.setAllButtonsLock(false);
            });
    });
});

form.getButton("in", btn => {
    btn.addEventListener("click", () => {
        if (isButtonLocked(btn))
            return

        form.setAllButtonsLock(true);
        form.hideError();

        const { email, password } = form.getInputs()
        AUTH.signInWithEmailAndPassword(email, password)
            .then(() => form.setAllButtonsLock(false))
            .catch(err => {
                form.showError(err.message || "Error occurred.");
                form.setAllButtonsLock(false);
            });
    });
});

form.getButton("up", btn => {
    btn.addEventListener("click", () => {
        if (isButtonLocked(btn))
            return

        form.setAllButtonsLock(true);
        form.hideError();

        const { email, password } = form.getInputs()
        AUTH.createUserWithEmailAndPassword(email, password)
            .then(() => form.setAllButtonsLock(false))
            .catch(err => {
                form.showError(err.message || "Error occurred.");
                form.setAllButtonsLock(false);
            });
    });
});