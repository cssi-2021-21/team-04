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

// # UTIL
/**
 * @template T
 */
class BehaviorSubject {

    /**
     * Creates a new BehaviorSubject with the provided default value
     * @param {T} defaultValue any default value 
     * @returns {BehaviorSubject} an instance of BehaviorSubject
     */
    constructor(defaultValue) {
        this._value = defaultValue;
        this._listeners = {};
    }

    /**
     * Get the current value
     * @returns {T} the current value of the BehaviorSubject
     */
    get value() {
        return this._value
    }

    /**
     * Feeds in the next value
     * @param {T} value the new value to give to listeners
     */
    next(value) {
        this._value = value;
        for (const id in this._listeners)
            this._listeners[id](this.value, id);
    }

    /**
     * Attaches a callback to the BehaviorSubject
     * @param {(val: T, id: string) => any} callback the callback to run when a new value gets fed in
     * @returns {void} Nothing 
     */
    subscribe(callback) {
        let id;
        do {
            id = ""+Math.random().toString(16).slice(2)
        } while (this._listeners[id])

        this._listeners[id] = callback;
        callback(this.value, id);
    }

    /**
     * Deletes a listener from the BehaviorSubject
     * @param {string} id the id of the callback to delete 
     * @returns {void} Nothing
     */
    unsubscribe(id) {
        delete this._listeners[id];
    }

}

// # APP
const REGEXES = Object.freeze({
    hexColor: /^#(?:[0-9a-f]{3}){1,2}$/i,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i
});
const DEFAULT_TARGETS = Object.freeze({
    /** listen to this target for updates to the user object */
    user: "user",

    /** listen to this target for updates to the user data on the database */
    userData: "user-data",

    /** listen to this target for updates to all users' names, colors, and photoUrls */
    publicUsers: "public-users"
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
        users: {
            // <key = uid> = <value = { name, color, url }>
        }
        // <key>: <value>
    }

    constructor() {
        this.registerListenerTarget(
            DEFAULT_TARGETS.user, 
            callListeners => AUTH.onAuthStateChanged(user => callListeners(user))
        );
        this.registerListenerTarget(
            DEFAULT_TARGETS.publicUsers, 
            callListeners => DB.ref("public-users").on('value', snap => {
                const val = snap.val();
                if (!val)
                    return;

                for (const [uid, user] of Object.entries(val)) {
                    if (!this._values.users[uid])
                        this._values.users[uid] = {};
                    this._values.users[uid].name = user.name;
                    this._values.users[uid].color = user.color;
                    this._values.users[uid].url = user.url || null;
                }

                callListeners(this._values.users);
            })
        );
        this.registerListener(DEFAULT_TARGETS.user, (_, user) => {
            if (!user)
                return window.location.href = "..";
        }, false);
        this.registerListener(DEFAULT_TARGETS.user, (_, user) => {
            if (!user || this._booleans.latchedOntoUser)
                return;

            /** @type {(data: any) => any} */
            let updateUserData = undefined
            DB.ref(`/users/${user.uid}`).on('value', snap => {
                const val = snap.val();
                if (!val) {
                    const name = user.displayName ?? user.email.split('@')[0],
                        color = '#'+Math.random().toString(16).substr(2,6),
                        url = user.photoURL;
                    
                    DB.ref().update({
                        [`/users/${user.uid}`]: {
                            name,
                            image: {
                                color,
                                url
                            },
                            meta: {
                                created: new Date().getTime()
                            }
                        },
                        [`/public-users/${user.uid}`]: {
                            name,
                            color,
                            url
                        }
                    });
                }

                if (updateUserData)
                    updateUserData(val);

                if (this._booleans.latchedOntoUser)
                    return;
                
                this._booleans.latchedOntoUser = true;
                this.registerListenerTarget(
                    DEFAULT_TARGETS.userData,
                    callListeners => {
                        updateUserData = callListeners;
                        callListeners(val);
                    }
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
     * Checks if the passed in value is not null or undefined.
     * @param {*} val the value to check
     * @returns {boolean} false if value is null or undefined
     */
    _isDefined(val) {
        return val !== null && val !== undefined;
    } 

    /**
     * Registers a target that listeners can subscribe to
     * @param {string} name the id of the target
     * @param {(callListeners: (...params: any[]) => void) => void} registerFunc a callback that uses the passed callListeners function
     * @returns {void} Nothing
     */
    registerListenerTarget(name, registerFunc) {
        if (!this._isDefined(name) || !this._isDefined(registerFunc))
            return;

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
     * @param {boolean} [callImmediately = true] whether or not to run the callback immediately with the latest value
     * @returns {void} Nothing
     */
    registerListener(target, callback, callImmediately = true) {
        if (!this._isDefined(target) || !this._isDefined(callback))
            return;

        const listener = {
            func: callback,
            dead: false,
            id: null
        }

        if (!this._listeners[target])
            this._listeners[target] = [[undefined], listener]
        else
            this._listeners[target].push(listener);
        
        listener.id = `${target}-${this._listeners[target].length}`;

        if (callImmediately)
            callback(listener.id, ...this._listeners[target][0]);
    }

    /**
     * Kills a listener that matches the provided id
     * @param {string} the id of the listener
     * @returns {void} Nothing
     */
    killListener(id) {
        if (!this._isDefined(id))
            return;

        const [target, index] = id.split('-');
        if (
            !target || 
            !index || 
            !this._listeners[target] ||
            !this._listeners[target][+index]
        ) return;
        this._listeners[target][+index].dead = true;
    }

    /**
     * Looks up a user's information base on user id
     * @param {string} uid the id of the person to lookup
     * @param {(data: {
     *  name: string,
     *  color: string,
     *  url: string | null
     * } | null) => any} [callbackOnUpdate] a callback to run whenever a potential user info update happens
     * @returns {{
     *  name: string,
     *  color: string,
     *  url: string | null
     * } | null} the user's personal information
     */
    lookupUser(uid, callbackOnUpdate) {
        if (!this._isDefined(uid))
            return null;

        const getUser = () => this._values.users[uid] || null;
        if (callbackOnUpdate)
            this.registerListener(DEFAULT_TARGETS.publicUsers,
                () => callbackOnUpdate(getUser())
            );
        return getUser();
    }

    /**
     * Adds a friend to the current user's account
     * @param {string} uid the user id of the person you want to befriend
     * @param {() => any} [onSuccess] the callback to run when operation is successful
     * @param {(error: Error) => any} [onFail] the callback to run when operation is NOT successful
     * @param {void} Nothing
     */
    addFriend(uid, onSuccess, onFail) {
        if (!this.isLoggedIn) {
            if (onFail)
                onFail(new Error("Cannot add friend because the current user is not logged in."));
            return;
        }

        if (!this._isDefined(uid)) {
            if (onFail)
                onFail(new Error("You need the person's UID to add them."));
            return;
        } 

        const myUid = this.user.uid;
        if (myUid === uid) {
            if (onFail)
                onFail(new Error("Cannot add yourself as a friend."));
            return;
        }

        DB.ref().update({
            [`/users/${myUid}/friends/${uid}`]: true,
            [`/users/${uid}/friends/${myUid}`]: true
        }, err => {
            if (err) {
                if (onFail)
                    onFail(new Error(err.message));
                return;
            }
            if (onSuccess)
                onSuccess();
        });
    }

    /**
     * Removes a friend from the current user's account
     * @param {string} uid the user id of the person you want to unfriend
     * @param {() => any} [onSuccess] the callback to run when operation is successful
     * @param {(error: Error) => any} [onFail] the callback to run when operation is NOT successful
     * @returns {void} Nothing
     */
    removeFriend(uid, onSuccess, onFail) {
        if (!this.isLoggedIn) {
            if (onFail)
                onFail(new Error("Cannot remove friend because the current user is not logged in."));
            return;
        }

        if (!this._isDefined(uid)) {
            if (onFail)
                onFail(new Error("You need the person's UID to add them."));
            return;
        } 

        DB.ref().update({
            [`/users/${this.user.uid}/friends/${uid}`]: null,
            [`/users/${uid}/friends/${this.user.uid}`]: null
        }, err => {
            if (err) {
                if (onFail)
                    onFail(new Error(err.message));
                return;
            }
            if (onSuccess)
                onSuccess();
        });
    }

    /**
     * Log a workout to the user's account
     * @param {string} name the name of the workout
     * @param {number} duration the duration of the workout in minutes
     * @param {number} calories the total amount of calories burnt
     * @param {(id: string) => any} [onSuccess] the callback to run when operation is successful (id = id of workout)
     * @param {(error: Error) => any} [onFail] the callback to run when operation is NOT successful
     * @returns {void} Nothing
     */
    logWorkout(name, duration, calories, onSuccess, onFail) {
        if (!this.isLoggedIn) {
            if (onFail)
                onFail(new Error("Cannot log workout because the current user is not logged in."));
            return;
        }

        if (!this._isDefined(name) || !this._isDefined(duration) || !this._isDefined(calories)) {
            if (onFail)
                onFail(new Error("Invalid workout data passed."));
            return;
        } 

        const root = DB.ref(`/users/${this.user.uid}/workouts`);
        const id = root.push().key;

        root.child(id).set({
            name: name.trim(),
            duration,
            calories,
            timestamp: new Date().getTime()
        }, err => {
            if (err) {
                if (onFail)
                    onFail(new Error(err.message));
                return;
            }
            if (onSuccess)
                onSuccess(id);
        });
    }

    /**
     * Edits a current workout using the current user's credentials.
     * @param {string} workoutId the id of the workout to edit
     * @param {{
     *  name?: string, 
     *  duration?: number, 
     *  calories?: number
     * } | null} data the new data of the workout (Setting this to null will delete the workout.)
     * @param {() => any} [onSuccess] the callback to run when operation is successful
     * @param {(error: Error) => any} [onFail] the callback to run when operation is NOT successful
     * @returns {void} Nothing
     */
    editWorkout(workoutId, data, onSuccess, onFail) {
        if (!this.isLoggedIn) {
            if (onFail)
                onFail(new Error("Cannot edit workout because the current user is not logged in."));
            return;
        }

        if (!this._isDefined(workoutId) || !this._isDefined(data)) {
            if (onFail)
                onFail(new Error("invalid workout information passed."));
            return;
        }
        
        const REF = DB.ref(`/users/${this.user.uid}/workouts/${workoutId}`);
        REF.once('value')
            .then(snap => snap.val())
            .then(val => {
                if (!val) {
                    if (onFail)
                        onFail(new Error("Workout does not exist."));
                    return;
                }

                if (!data)
                    REF.set(null, err => {
                        if (err) {
                            if (onFail)
                                onFail(new Error("Failed to delete the post: " + err.message));
                            return;
                        }
                        if (onSuccess)
                            onSuccess();
                    });
                else {
                    if (data.name) {
                        const name = `${data.name}`.trim();
                        if (!name) {
                            if (onFail)
                                onFail(new Error("Workout name cannot be an empty string."));
                            return;
                        }

                        payload["name"] = name;
                    }
                    if (this._isDefined(data.duration))
                        payload["duration"] = data.duration + 0;
                    if (this._isDefined(data.calories))
                        payload["calories"] = data.calories + 0;
                    REF.update(payload, err => {
                        if (err) {
                            if (onFail)
                                onFail(new Error("Failed to update the workout: " + err.message));
                            return;
                        }
                        if (onSuccess)
                            onSuccess();
                    });
                }
            })
            .catch(err => {
                if (err && onFail)
                    onFail(new Error(err.message));
            });
    }

    /**
     * Deletes a workout from the user's account by id
     * @param {string} workoutId the id of the workout to delete
     * @param {() => any} [onSuccess] the callback to run when operation is successful
     * @param {(error: Error) => any} [onFail] the callback to run when operation is NOT successful
     * @returns {void} Nothing
     */
    deleteWorkout(workoutId, onSuccess, onFail) {
        if (!this.isLoggedIn) {
            if (onFail)
                onFail(new Error("Cannot delete workout because the current user is not logged in."));
            return;
        }

        if (!this._isDefined(workoutId)) {
            if (onFail)
                onFail(new Error("Invalid workout ID passed."));
            return;
        } 
        
        DB.ref(`/users/${this.user.uid}/workouts`).update({
            [workoutId]: null
        }, err => {
            if (err) {
                if (onFail)
                    onFail(new Error(err.message));
                return;
            }
            if (onSuccess)
                onSuccess();
        });
    }

    /**
     * Updates the current user information.
     * @param {{
     *  name?: string,
     *  color?: string,
     *  url?: string
     * }} data the new data to update the current user with [name = the name of the user] [color = the hex color string] [url = the url of the image]
     * @param {() => any} [onSuccess] the callback to run when operation is successful
     * @param {(error: Error) => any} [onFail] the callback to run when operation is NOT successful
     * @returns {void} Nothing
     */
    updateUserInfo(data, onSuccess, onFail) {
        if (!this.isLoggedIn) {
            if (onFail)
                onFail(new Error("Cannot change user info because the current user is not logged in."));
            return;
        }

        if (!this._isDefined(data)) {
            if (onFail)
                onFail(new Error("Invalid new user data passed."));
            return;
        }

        const payload = {},
            uid = this.user.uid;

        if (data.name) {
            const name = `${data.name}`.trim();
            if (!name) {
                if (onFail)
                    onFail(new Error("The user's new name is invalid."));
                return;
            }

            payload[`/users/${uid}/name`] = name;
            payload[`/public-users/${uid}/name`] = name;
        }
        if (data.color) {
            const color = `${data.color}`.trim();
            if (!REGEXES.hexColor.test(color)) {
                if (onFail)
                    onFail(new Error("The user's new color is invalid."));
                return;
            }

            payload[`/users/${uid}/image/color`] = color;
            payload[`/public-users/${uid}/color`] = color;
        }
        if (data.url) {
            const url = `${data.url}`.trim();
            if (!REGEXES.url.test(url)) {
                if (onFail)
                    onFail(new Error("The user's new image URL is invalid."));
                return;
            }
            
            payload[`/users/${uid}/image/url`] = url;
            payload[`/public-users/${uid}/url`] = url;
        }
        
        DB.ref().update(payload, err => {
            if (err) {
                if (onFail)
                    onFail(new Error(err.message));
                return;
            }
            if (onSuccess)
                onSuccess();
        });
    }

    /**
     * Creates a new post using the current user's credentials.
     * @param {string} message the message to send with the post
     * @param {string} [gif] the url of the GIF to send with the post
     * @param {boolean} [isPublic = true] whether or not to make the post public
     * @param {(id: string) => any} [onSuccess] the callback to run when operation is successful (id = id of post)
     * @param {(error: Error) => any} [onFail] the callback to run when operation is NOT successful
     * @returns {void} Nothing 
     */
    createPost(message, gif, isPublic = true, onSuccess, onFail) {
        if (!this.isLoggedIn) {
            if (onFail)
                onFail(new Error("Cannot create post because the current user is not logged in."));
            return;
        }

        const parsedMessage = `${message}`.trim();
        if (!parsedMessage) {
            if (onFail)
                onFail(new Error("Message cannot be an empty string."));
            return;
        }

        const parsedGif = gif === null || gif === undefined ? null : `${gif}`.trim();
        if (typeof parsedGif == "string" && !REGEXES.url.test(parsedGif)) {
            if (onFail)
                onFail(new Error("GIF url is invalid."));
            return;
        }

        const root = DB.ref(`/posts`);
        const id = root.push().key;
        const stamp = new Date().getTime();

        root.child(id).set({
            author: this.user.uid,
            public: isPublic,
            gif: parsedGif,
            message: parsedMessage,
            meta: {
                created: stamp,
                updated: stamp
            }
        }, err => {
            if (err) {
                if (onFail)
                    onFail(new Error(err.message));
                return;
            }
            if (onSuccess)
                onSuccess(id);
        });
    }

    /**
     * Edits a current post using the current user's credentials.
     * @param {string} postId the id of the post to edit
     * @param {{
     *  message?: string,
     *  gif?: string
     * } | null} data the new data of the post (Setting this to null will delete the post.)
     * @param {() => any} [onSuccess] the callback to run when operation is successful
     * @param {(error: Error) => any} [onFail] the callback to run when operation is NOT successful
     * @returns {void} Nothing
     */
    editPost(postId, data, onSuccess, onFail) {
        if (!this.isLoggedIn) {
            if (onFail)
                onFail(new Error("Cannot edit post because the current user is not logged in."));
            return;
        }

        if (!this._isDefined(postId)) {
            if (onFail)
                onFail(new Error("Post ID is not valid."));
            return;
        }
        
        const REF = DB.ref(`/posts/${postId}`);
        REF.once('value')
            .then(snap => snap.val())
            .then(val => {
                if (!val) {
                    if (onFail)
                        onFail(new Error("Post does not exist."));
                    return;
                }

                if (val.author !== this.user.uid) {
                    if (onFail)
                        onFail(new Error("Cannot edit post because the post was not written by the current user."));
                    return;
                }

                if (!data)
                    REF.set(null, err => {
                        if (err) {
                            if (onFail)
                                onFail(new Error("Failed to delete the post: " + err.message));
                            return;
                        }
                        if (onSuccess)
                            onSuccess();
                    });
                else {
                    const payload = {
                        "meta/updated": new Date().getTime()
                    }
                    if (data.message) {
                        const message = `${data.message}`.trim();
                        if (!message) {
                            if (onFail)
                                onFail(new Error("Post message cannot be an empty string."));
                            return;
                        }

                        payload["message"] = message;
                    }
                    if (data.gif) {
                        const gif = data.gif === null || data.gif === undefined ? data.gif : `${data.gif}`.trim();
                        if (typeof gif == "string" && !REGEXES.url.test(gif)) {
                            if (onFail)
                                onFail(new Error("Post GIF url is invalid."));
                            return;
                        }

                        payload["gif"] = gif;
                    } else payload["gif"] = null;
                    REF.update(payload, err => {
                        if (err) {
                            if (onFail)
                                onFail(new Error("Failed to update the post: " + err.message));
                            return;
                        }
                        if (onSuccess)
                            onSuccess();
                    });
                }
            })
            .catch(err => {
                if (err && onFail)
                    onFail(new Error(err.message));
            });
    }

    /**
     * Creates a comment on a post provided by id
     * @param {string} postId the id of the post to comment on
     * @param {string} message the message to send with the comment
     * @param {(id: string) => any} [onSuccess] the callback to run when operation is successful (id = id of comment)
     * @param {(error: Error) => any} [onFail] the callback to run when operation is NOT successful
     */
    createComment(postId, message, onSuccess, onFail) {
        if (!this.isLoggedIn) {
            if (onFail)
                onFail(new Error("Cannot create comment to post because the current user is not logged in."));
            return;
        }

        if (!this._isDefined(postId) || !this._isDefined(message)) {
            if (onFail)
                onFail(new Error("Invalid comment data passed."));
            return;
        }
        
        DB.ref(`/posts/${postId}`).once('value')
            .then(snap => snap.val())
            .then(val => {
                if (!val) {
                    if (onFail)
                        onFail(new Error("Post does not exist."));
                    return;
                }

                const parsedMessage = `${message}`.trim();
                if (!parsedMessage) {
                    if (onFail)
                        onFail(new Error("Message cannot be an empty string."));
                    return;
                }

                const id = DB.ref(`/comments`).push().key;
                const stamp = new Date().getTime();

                DB.ref().update({
                    [`/posts/${postId}/comments/${id}`]: stamp,
                    [`/comments/${id}`]: {
                        author: this.user.uid,
                        message: parsedMessage,
                        target: postId,
                        meta: {
                            created: stamp,
                            updated: stamp
                        }
                    }
                }, err => {
                    if (err) {
                        if (onFail)
                            onFail(new Error("Failed to create comment on the post: " + err.message));
                        return;
                    }
                    if (onSuccess)
                        onSuccess(id);
                });
            })
            .catch(err => {
                if (err && onFail)
                    onFail(new Error(err.message));
            });
    }

    /**
     * Edts a comment provided by id
     * @param {string} commentId the id of the comment to edit 
     * @param {string} message the new message for the comment
     * @param {() => any} [onSuccess] the callback to run when operation is successful
     * @param {(error: Error) => any} [onFail] the callback to run when operation is NOT successful
     */
    editComment(commentId, message, onSuccess, onFail) {
        if (!this.isLoggedIn) {
            if (onFail)
                onFail(new Error("Cannot edit comment to post because the current user is not logged in."));
            return;
        }

        if (!this._isDefined(commentId) || !this._isDefined(message)) {
            if (onFail)
                onFail(new Error("Invalid comment data passed."));
            return;
        }

        const ref = DB.ref(`/comments/${commentId}`);
        ref.once('value')
            .then(snap => snap.val())
            .then(val => {
                if (!val) {
                    if (onFail)
                        onFail(new Error("Comment does not exist."));
                    return;
                }

                if (val.author !== this.user.uid) {
                    if (onFail)
                        onFail(new Error("Cannot edit comment because the comment was not written by the current user."));
                    return;
                }

                const parsedMessage = `${message}`.trim();
                if (!parsedMessage) {
                    if (onFail)
                        onFail(new Error("Message cannot be an empty string."));
                    return;
                }

                ref.update({
                    message: parsedMessage,
                    "meta/updated": new Date().getTime()
                }, err => {
                    if (err) {
                        if (onFail)
                            onFail(new Error("Failed to edit comment: " + err.message));
                        return;
                    }
                    if (onSuccess)
                        onSuccess();
                });
            })
            .catch(err => {
                if (err && onFail)
                    onFail(new Error(err.message));
            });
    }

    /**
     * Like a post using the current user's credentials
     * @param {string} postId the id of the post to comment on
     * @param {() => any} [onSuccess] the callback to run when operation is successful
     * @param {(error: Error) => any} [onFail] the callback to run when operation is NOT successful
     */
    likePost(postId, onSuccess, onFail) {
        if (!this.isLoggedIn) {
            if (onFail)
                onFail(new Error("Cannot like post because the current user is not logged in."));
            return;
        }

        if (!this._isDefined(postId)) {
            if (onFail)
                onFail(new Error("Invalid post ID passed."));
            return;
        }
        
        const ref = DB.ref(`/posts/${postId}`);
        ref.once('value')
            .then(snap => snap.val())
            .then(val => {
                if (!val) {
                    if (onFail)
                        onFail(new Error("Post does not exist."));
                    return;
                }

                ref.child('likes').update({
                    [this.user.uid]: true
                }, err => {
                    if (err) {
                        if (onFail)
                            onFail(new Error("Failed to like the post: " + err.message));
                        return;
                    }
                    if (onSuccess)
                        onSuccess();
                });
            })
            .catch(err => {
                if (err && onFail)
                    onFail(new Error(err.message));
            });
    }

    /**
     * Remove the user's like from a post
     * @param {string} postId the id of the post to comment on
     * @param {() => any} [onSuccess] the callback to run when operation is successful
     * @param {(error: Error) => any} [onFail] the callback to run when operation is NOT successful
     */
    hatePost(postId, onSuccess, onFail) {
        if (!this.isLoggedIn) {
            if (onFail)
                onFail(new Error("Cannot unlike post because the current user is not logged in."));
            return;
        }
        
        if (!this._isDefined(postId)) {
            if (onFail)
                onFail(new Error("Invalid post ID passed."));
            return;
        }

        const ref = DB.ref(`/posts/${postId}`);
        ref.once('value')
            .then(snap => snap.val())
            .then(val => {
                if (!val) {
                    if (onFail)
                        onFail(new Error("Post does not exist."));
                    return;
                }

                ref.child('likes').update({
                    [this.user.uid]: null
                }, err => {
                    if (err) {
                        if (onFail)
                            onFail(new Error("Failed to unlike the post: " + err.message));
                        return;
                    }
                    if (onSuccess)
                        onSuccess();
                });
            })
            .catch(err => {
                if (err && onFail)
                    onFail(new Error(err.message));
            });
    }

    /**
     * Fetches a rendered informational object about a post that updates in real-time
     * @param {string} postId the id of the post to fetch
     */
    getPost(postId) {
        if (!this._isDefined(postId)) {
            if (onFail)
                onFail(new Error("Invalid post ID passed."));
            return;
        }
        
        const THIS = this;

        /** @type {BehaviorSubject<{ id: string, name: string, color: string, url: string | null }>} */
        const $author = new BehaviorSubject(null);

        /** @type {BehaviorSubject<{ liked: boolean, count: number }>} */
        const $likes = new BehaviorSubject(null);

        /** @type {BehaviorSubject<string>} */
        const $message = new BehaviorSubject(null);

        /** @type {BehaviorSubject<string>} */
        const $gif = new BehaviorSubject(null);

        /** @type {BehaviorSubject<number>} */
        const $created = new BehaviorSubject(null);

        /** @type {BehaviorSubject<number>} */
        const $updated = new BehaviorSubject(null);

        /** @type {BehaviorSubject<{ author: { id: string, name: string, color: string, url: string | null }, message: string, created: number, updated: number }[]>} */
        const $comments = new BehaviorSubject(null);

        const REF = DB.ref(`/posts/${postId}`);
        REF.once('value')
            .then(snap => snap.val())
            .then(val => {
                if (!val)
                    return;

                const authorId = val.author;
                THIS.lookupUser(authorId, data => $author.next(
                    data ?
                    {
                        id: authorId,
                        ...data
                    } :
                    null
                ));

                REF.child('likes').on('value', likesSnap => {
                    const likesVal = likesSnap.val();
                    const out = {
                        liked: false,
                        count: 0
                    };

                    if (likesVal) {
                        const likers = new Set(Object.keys(likesVal));
                        if (THIS.isLoggedIn && likers.has(THIS.user.uid))
                            out.liked = true;
                        out.count = likers.size;
                    }
                    
                    $likes.next(out);
                });

                REF.child('message').on('value', messageSnap => {
                    const messageVal = messageSnap.val();
                    $message.next(`${messageVal ?? ""}`.trim());
                });

                REF.child('gif').on('value', gifSnap => {
                    const snapVal = gifSnap.val();
                    $gif.next(`${snapVal ?? ""}`.trim());
                });

                REF.child('meta').child('created').on('value', createdSnap => {
                    const createdVal = createdSnap.val();
                    $created.next(createdVal ?? 0);
                });

                REF.child('meta').child('updated').on('value', updatedSnap => {
                    const updatedVal = updatedSnap.val();
                    $updated.next(updatedVal ?? 0);
                });

                const commentRefs = [];
                REF.child('comments').on('value', commentsSnap => {
                    const commentsVal = commentsSnap.val();

                    while (commentRefs.length) {
                        commentRefs[0].off();
                        commentRefs.splice(0, 1);
                    }

                    if (!commentsVal)
                        return $comments.next([]);
                    
                    const commentators = Object.entries(commentsVal);
                    commentators.sort((a, b) => a[1] - b[1]);

                    const comments = [];
                    for (const [commentId] of commentators) {
                        const data = {
                            author: { 
                                id: null, 
                                name: null, 
                                color: null, 
                                url: null 
                            }, 
                            message: "", 
                            created: 0, 
                            updated: 0
                        }
                        comments.push(data);

                        const emptyAuthor = () => {
                            data.author.id = null;
                            data.author.name = null;
                            data.author.color = null;
                            data.author.url = null;
                        }

                        const commentRef = DB.ref(`/comments/${commentId}`);
                        commentRef.once('value', commentSnap => {
                            const commentVal = commentSnap.val();
                            if (!commentVal) {
                                data.message = "";
                                data.created = 0;
                                data.updated = 0;
                                return emptyAuthor();
                            }

                            const commentAuthorId = commentVal.author;
                            THIS.lookupUser(commentAuthorId, authorData => {
                                if (!authorData)
                                    return emptyAuthor();
                                data.author.id = commentAuthorId;
                                data.author.name = authorData.name;
                                data.author.color = authorData.color;
                                data.author.url = authorData.url || null;
                            });

                            const msgRef = commentRef.child('message');
                            commentRefs.push(msgRef); 
                            msgRef.on('value', msgSnap => {
                                const msgVal = msgSnap.val();
                                if (msgVal === null)
                                    data.message = "";
                                else
                                    data.message = `${msgVal}`.trim();
                            });

                            const createdRef = commentRef.child('meta').child('created');
                            commentRefs.push(createdRef); 
                            createdRef.on('value', createdSnap => data.created = createdSnap.val() ?? 0);

                            const updatedRef = commentRef.child('meta').child('created');
                            commentRefs.push(updatedRef); 
                            updatedRef.on('value', updatedSnap => data.updated = updatedSnap.val() ?? 0);
                        });
                    }

                    $comments.next(comments);
                })
            })
            .catch(() => {});

        return {
            id: postId,
            $author,
            $likes,
            $message,
            $gif,
            $created,
            $updated,
            $comments
        };
    }

}()