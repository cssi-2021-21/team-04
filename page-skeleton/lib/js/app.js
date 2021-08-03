console.log("app.js running.");

// # Firebase
firebase.initializeApp({
    apiKey: "AIzaSyBJxja4Sd-os7iEiIOHpwtj0VgDtmUUO-0",
    authDomain: "cssi-2021-team-04.firebaseapp.com",
    projectId: "cssi-2021-team-04",
    storageBucket: "cssi-2021-team-04.appspot.com",
    messagingSenderId: "572149620254",
    appId: "1:572149620254:web:e4f78ac7128d8d713cd80f"
});
const [ DB, AUTH ] = "database:auth".split(':').map(e => firebase[e]());

// # APP
const DEFAULT_TARGETS = Object.freeze({
    /** listen to this target for updates to the user object */
    user: "user",

    /** listen to this target for updates to the user data on the database */
    userData: "user-data"
});
const APP = new class {

    _booleans = {
        latchedOntoUser: false
        // <key>: <state>
    }
    _listeners = {
        // <target>: <listener>[]
    }
    _values = {
        // <key>: <value>
    }

    constructor() {
        this.registerListenerTarget(
            DEFAULT_TARGETS.user, 
            callListeners => AUTH.onAuthStateChanged(user => callListeners(user))
        );
        this.registerListener(DEFAULT_TARGETS.user, (_, user) => {
            if (!user)
                return window.location.href = "..";
        }, false);
        this.registerListener(DEFAULT_TARGETS.user, (_, user) => {
            if (!user || this._booleans.latchedOntoUser)
                return;

            const REF = DB.ref(`/users/${user.uid}`);
            REF.on('value', snap => {
                const val = snap.val();
                if (!val)
                    REF.set({
                        name: user.displayName ?? user.email.split('@')[0],
                        image: {
                            color: '#'+Math.random().toString(16).substr(2,6),
                            url: user.photoURL
                        },
                        meta: {
                            created: new Date().getTime()
                        }
                    });

                if (this._booleans.latchedOntoUser)
                    return;
                
                this._booleans.latchedOntoUser = true;
                this.registerListenerTarget(
                    DEFAULT_TARGETS.userData,
                    callListeners => callListeners(val)
                );
            }, () => {
                this._booleans.latchedOntoUser = false;
            });
        });
    }

    /**
     * Gets the current user
     * @returns {object} the user object if logged in 
     */
     get user() {
        return AUTH.currentUser;
    }

    /**
     * Tells you if the user is logged in or not
     * @returns {boolean} whether the current user object exists
     */
    get isLoggedIn() {
        return !!this.user;
    }

    /**
     * Registers a target that listeners can subscribe to
     * @param {string} name the id of the target
     * @param {(callListeners: (...params: any[]) => void) => void} registerFunc a callback that uses the passed callListeners function
     * @returns {void} Nothing
     */
    registerListenerTarget(name, registerFunc) {
        const LISTENERS = this._listeners[name] ?? [[undefined]];
        this._listeners[name] = LISTENERS;

        registerFunc((...params) => {
            LISTENERS[0] = params;

            const trueLISTENERS = LISTENERS.slice(1).filter(l => !l.dead);
            for (const { func, id } of trueLISTENERS)
                func(id, ...params);
        });
    }

    /**
     * Registers a new listener to a specific target
     * @param {string} target the id of the listener-target
     * @param {(listenerId: string, ...params: any[]) => any} callback the function to call when the listener gets a new value
     * @param {boolean} callImmediately whether or not to run the callback immediately with the latest value
     * @returns {void} Nothing
     */
    registerListener(target, callback, callImmediately = true) {
        const listener = {
            func: callback,
            dead: false,
            id: `${target}-${this._listeners[target].length}`
        }

        if (!this._listeners[target])
            this._listeners[target] = [[undefined], listener]
        else
            this._listeners[target].push(listener);

        if (callImmediately)
            callback(listener.id, ...this._listeners[target][0]);
    }

    /**
     * Kills a listener that matches the provided id
     * @param {string} the id of the listener
     * @returns {void} Nothing
     */
    killListener(id) {
        const [target, index] = id.split('-');
        if (
            !target || 
            !index || 
            !this._listeners[target] ||
            !this._listeners[target][+index]
        ) return;
        this._listeners[target][+index].dead = true;
    }

}()