console.log("main.js running.");

APP.registerListener(DEFAULT_TARGETS.user, (id, user) => {
    if (!user)
        return;
    APP.killListener(id);

    // # DOM
    /**
     * Get a specific element from a node or the document
     * @param {HTMLElement | string} selectorOrTarget HTMLElement or selector to use
     * @param {string} [selector] the css selector to use when first parameter is not a selector
     * @returns {HTMLElement} the selected element
     */
    const get = (selectorOrTarget, selector) => {
        if (typeof selectorOrTarget == "string")
            return get(document, selectorOrTarget);
        if (!selector)
            return null;
        return selectorOrTarget.querySelector(selector);
    }

    const MODALS_SVC = new class {

        /** @type {Set<string>} */
        _active = new Set()

        /**
         * Updates the UI based on the number 
         * @returns {void} Nothing
         */
        updateUI() {
            document.body.classList[this._active.size ? "add" : "remove"]("modal-open");
        }

        /**
         * Logs a modal ID to mark it as active
         * @param {string} id the id of the modal
         * @returns {void} Nothing
         */
        logModal(id) {
            this._active.add(id);
            this.updateUI();
        }

        /**
         * Remvoes a logged modal ID to mark it as inactive
         * @param {string} id the id of the modal
         * @returns {void} Nothing
         */
        removeModal(id) {
            this._active.delete(id);
            this.updateUI();
        }

    }();

    const GIF_SEARCHER = new class {

        id = "GIF_SEARCHER";
        node = get("main > section.gif-searcher");

        /** @type {{ [s: string]: HTMLElement }} */
        _nodes = {
            container: null,
            searchInput: null,
            searchBtn: null,
            resultsBox: null,
            cancelBtn: null,
            confirmBtn: null
        }

        $close = new BehaviorSubject("");

        /** @type {string} */
        _selected = null;

        /** @type {HTMLElement} */
        _selectedNode = null;

        busy = false;
        count = 0;

        constructor() {
            this.node.innerHTML = `
                <div class="content">
                    <h1>
                        <span>GIF-searcher</span>
                        <img src="https://cdn.glitch.com/89fb5b85-4c20-461c-abe1-c7f1bd17c13c%2FPoweredby_100px-White_VertText.png?v=1619531592690" alt="Powered by Giphy"/>
                    </h1>
                    <div class="search">
                        <p>search for a gif, select one, and continue</p>
                        <form action="javascript:void(0)" class="input">
                            <input type="search" placeholder="ex: cats">
                            <button>
                                <span class="material-icons">search</span>
                            </button>
                        </form>
                    </div>
                    <div class="results">
                        <p>GIF results show up here!</p>
                    </div>
                    <div class="action">
                        <button>cancel</button>
                        <button class="continue-btn hidden">continue</button>
                    </div>
                </div>
            `;

            this._nodes.container = get(this.node, "div.content");
            this._nodes.searchInput = get(this._nodes.container, "div.search > form > input");
            this._nodes.searchBtn = get(this._nodes.container, "div.search > form > button");
            this._nodes.resultsBox = get(this._nodes.container, "div.results");
            this._nodes.cancelBtn = get(this._nodes.container, "div.action > button:not(.continue-btn)");
            this._nodes.confirmBtn = get(this._nodes.container, "div.action > button.continue-btn");

            const THIS = this;
            this._nodes.container.addEventListener('click', e => e.stopPropagation());
            this._nodes.searchBtn.addEventListener('click', () => {
                if (THIS.busy)
                    return;
                THIS.lookup();
            });
            this._nodes.cancelBtn.addEventListener('click', () => {
                if (THIS.busy)
                    return;
                THIS.close();
            });
            this._nodes.confirmBtn.addEventListener('click', () => {
                if (THIS.busy || !THIS.hasSelected)
                    return;
                THIS.close(THIS._selected);
            });
        }

        /**
         * Determines whether or not an url has been selected.
         * @returns {boolean} if a url has been selected
         */
        get hasSelected() {
            return this._selected !== null;
        }

        /**
         * Selects a GIF from the results box.
         * @param {string} url the url of the GIF
         * @param {HTMLElement} [node] the selected node
         * @returns {void} Nothing 
         */
        select(url, node) {
            const parsedUrl = (url || "").trim();
            this._selected = parsedUrl && REGEXES.url.test(parsedUrl) ? parsedUrl : null;
            this._nodes.confirmBtn.classList[this.hasSelected ? "remove" : "add"]("hidden");

            if (node) {
                if (this._selectedNode)
                    this._selectedNode.classList.remove("selected");
                this._selectedNode = node;
                node.classList.add("selected");
            }
        }
        /**
         * Empties the results and adds in a placeholder message.
         * @returns {void} Nothing
         */
        emptyResults() {
            this._nodes.resultsBox.innerHTML = "<p>GIF results show up here!</p>";
            this.select(null);
            this._selectedNode = null;
            this.count = 0;
        }

        /**
         * Adds a result to the results box.
         * @param {HTMLElement} node the node to add in results 
         * @returns {void} Nothing
         */
        addResult(node) {
            if (this.count == 0)
                this._nodes.resultsBox.innerHTML+= `
                    <div class="left"></div>
                    <div class="right"></div>
                `;
            
            const left = get(this._nodes.resultsBox, "div.left");
            const right = get(this._nodes.resultsBox, "div.right");

            const target = this.count%2 == 0 ? left : right;
            target.appendChild(node);
            this.count++;
        }

        /**
         * Looks up GIFs with the search query and fill in GIF results accordingly.
         * @returns {void} Nothing
         */
        lookup() {
            if (this.busy)
                return;
            
            const query = this.query;
            if (!query)
                return;

            this.lock();
            this.emptyResults();

            fetch(`https://api.giphy.com/v1/gifs/search?api_key=aov2JJZ0OuN558jFjNBJlgDG7zLF7x4l&q=${encodeURI(query)}&limit=10`)
                .then(res => res.json())
                .then(({ data }) => {
                    for (const GIFObj of data) {
                        const url = GIFObj.images.original.url;
                        
                        const img = document.createElement("img");
                        img.alt = `GIHPY: ${query}`;
                        img.src = url;
                        const overlay = document.createElement("div");
                        overlay.innerHTML = `<span class="material-icons">done</span>`;

                        const box = document.createElement("div");
                        box.appendChild(img);
                        box.appendChild(overlay);

                        img.addEventListener('click', () => this.select(url, box));

                        this.addResult(box);
                    }
                    this.unlock();
                })
                .catch(() => this.unlock());
        }

        /**
         * Unlocks the search button internally and visually by returning it to a normal color
         * @returns {void} Nothing
         */
        unlock() {
            this.busy = false;
            this._nodes.searchInput.removeAttribute("readonly");
            this._nodes.searchBtn.classList.remove("locked");
        }

        /**
         * Locks the search button internally and visually display it as red
         * @returns {void} Nothing
         */
        lock() {
            this.busy = true;
            this._nodes.searchInput.setAttribute("readonly", true);
            this._nodes.searchBtn.classList.add("locked");
        }

        /**
         * Opens the GIF searcher with an empty search bar
         * @returns {void} Nothing
         */
        open() {
            MODALS_SVC.logModal(this.id);
            this._nodes.searchInput.value = '';
            this.node.classList.remove("hidden");
            this.emptyResults();
        }

        /**
         * Closes the GIF searcher with a custom value
         * @param {string} val the result of the search to end the service with
         */
        close(val = "") {
            MODALS_SVC.removeModal(this.id);
            this.node.classList.add("hidden");
            this.$close.next(`${val}`.trim());
            this.emptyResults();
        }

        /**
         * @returns {string} the query term from the search input
         */
        get query() {
            return (this._nodes.searchInput.value || "").trim();
        }

    }();

    const POST_EDITOR = new class {

        id = "POST_EDITOR";
        node = get("main > section.post-editor");
        busy = false;

        /** @type {{ [s: string]: HTMLElement }} */
        _nodes = {
            container: null,
            messageInput: null,
            gifInput: null,
            gifAddBtn: null,
            gifDeleteBtn: null,
            gifPreview: null,
            gifPreviewImg: null,
            errorBox: null,
            errorBoxP: null,
            cancelBtn: null,
            confirmBtn: null
        }
        _data =  {
            message: null,
            gif: null,
            id: null
        }

        constructor() {
            this.node.innerHTML = `
                <div class="content">
                    <h1>post-editor</h1>
                    <div class="text">
                        <p>what's on your mind?</p>
                        <span class="textarea" contenteditable="true"></span>
                    </div>
                    <div class="gif">
                        <p>attach a GIF?</p>
                        <div class="input">
                            <input type="url" placeholder="GIF URL" readonly>
                            <button>
                                <span class="material-icons">search</span>
                            </button>
                            <button>
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                        <div class="preview hidden">
                            <img src="" alt="GIF">
                        </div>
                    </div>
                    <div class="error hidden">
                        <p>Error occured!</p>
                    </div>
                    <div class="action">
                        <button>cancel</button>
                        <button>post</button>
                    </div>
                </div>
            `;

            this._nodes.container = get(this.node, "div.content");
            this._nodes.messageInput = get(this._nodes.container, "div.text > span.textarea");
            this._nodes.gifInput = get(this._nodes.container, "div.gif > div.input > input");
            this._nodes.gifAddBtn = get(this._nodes.container, "div.gif > div.input > button:first-of-type");
            this._nodes.gifDeleteBtn = get(this._nodes.container, "div.gif > div.input > button:last-of-type");
            this._nodes.gifPreview = get(this._nodes.container, "div.gif > div.preview");
            this._nodes.gifPreviewImg = get(this._nodes.gifPreview, "img");
            this._nodes.cancelBtn = get(this._nodes.container, "div.action > button:first-of-type");
            this._nodes.confirmBtn = get(this._nodes.container, "div.action > button:last-of-type");
            this._nodes.errorBox = get(this._nodes.container, "div.error");
            this._nodes.errorBoxP = get(this._nodes.errorBox, "p");

            // this.node.addEventListener('click', () => this.close());
            this._nodes.container.addEventListener('click', e => e.stopPropagation());
            this._nodes.messageInput.addEventListener('input', e => this._data.message = `${e.target.innerText}`.trim());

            const THIS = this;
            this._nodes.gifAddBtn.addEventListener('click', () => {
                if (THIS.busy)
                    return;
                GIF_SEARCHER.open();
            });
            this._nodes.gifDeleteBtn.addEventListener('click', () => {
                if (THIS.busy)
                    return;
                THIS.loadGif('');
            });
            this._nodes.cancelBtn.addEventListener('click', () => {
                if (THIS.busy)
                    return;
                THIS.close();
            });
            this._nodes.confirmBtn.addEventListener('click', () => {
                if (THIS.busy)
                    return;
                THIS.busy = true;

                const { message, gif } = THIS.value;
                let parsedGif = gif;
                if (!parsedGif)
                    parsedGif = null;
                if (THIS.isCreating)
                    APP.createPost(message, parsedGif, true,
                        () => {
                            THIS.close();
                            THIS.busy = false;
                        },
                        (err) => {
                            THIS.loadError(err.message);
                            THIS.busy = false;
                        }
                    );
                else
                    APP.editPost(this._data.id, { message, gif: parsedGif },
                        () => {
                            THIS.close();
                            THIS.busy = false;
                        },
                        (err) => {
                            THIS.loadError(err.message);
                            THIS.busy = false;
                        }
                    );
            });

            GIF_SEARCHER.$close.subscribe(url => {
                if (url === "" && this.value.gif.length > 0)
                    return;
                this.loadGif(url);
            });
        }

        /**
         * Determines if the editor is currently in creator mode
         * @returns {boolean} whether or not clicking the confirm button will save or create a post
         */
        get isCreating() {
            return this._data.id === null;
        }

        /**
         * Empties the data from the post editor
         * @returns {void} Nothing
         */
        emptyData() {
            this.loadMessage(null);
            this.loadGif(null);
            this.loadError(null);
            this._data.id = null;
        }

        /**
         * Loads a new message
         * @param {string} msg the new message
         * @returns {void} Nothing
         */
        loadMessage(msg) {
            const parsedVal = (msg || "").trim();
            this._data.message = parsedVal;
            this._nodes.messageInput.innerText = parsedVal;
        }

        loadError(msg) {
            const parsedMsg = (msg || "").trim();
            if (!parsedMsg)
                return this._nodes.errorBox.classList.add("hidden");
            this._nodes.errorBox.classList.remove("hidden");
            this._nodes.errorBoxP.innerText = parsedMsg;
        }

        /**
         * Loads a new GIF
         * @param {string} url the url of the gif
         * @returns {void} Nothing
         */
        loadGif(url) {
            const trueURL = `${url}`.trim();
            if (url && REGEXES.url.test(trueURL)) {
                this._data.gif = trueURL;
                this._nodes.gifInput.value = trueURL;
                this._nodes.gifPreviewImg.src = trueURL;
                this._nodes.gifPreview.classList.remove("hidden");
                return;
            }
            this._data.gif = "";
            this._nodes.gifInput.value = "";
            this._nodes.gifPreview.classList.add("hidden");
        }

        /**
         * Shows/hides the post editor
         * @param {boolean} [hide = true] whether or not to hide the editor
         */
        _toggle(hide = true) {
            this.node.classList[hide ? "add" : "remove"]("hidden");
            MODALS_SVC[hide ? "removeModal" : "logModal"](this.id);
        }

        /**
         * Closes editor and empties the data
         * @returns {void} Nothing
         */
        close() {
            this.emptyData();
            this._toggle();
        }

        /**
         * Opens the editor with a clean slate
         * @returns {void} Nothing
         */
        cleanOpen() {
            this.emptyData();
            this._toggle(false);
            this._nodes.confirmBtn.innerText = this._data.id ? "save" : "post";
        }

        /**
         * Opens the editor with pre-filled values
         * @param {string} postId the id of the post to edit
         * @param {string} message the current message of the post
         * @param {string} gif the current gif url of the post 
         * @returns {void} Nothing
         */
        editOpen(postId, message, gif) {
            this.cleanOpen();
            this._data.id = postId;
            this.loadMessage((message ?? "") + "");
            this.loadGif((gif ?? "") + "");
            this._nodes.confirmBtn.innerText = postId ? "save" : "post";
        }

        /**
         * Get the most current values of editor
         * @returns {{ message: string, gif: string }} the current data values in the editor
         */
        get value() {
            return {
                message: (this._nodes.messageInput.innerText || "").trim(),
                gif: (this._nodes.gifInput.value || "").trim()
            }
        }

    }();

    const POST_VIEWER = new class {

        id = "POST_VIEWER";
        _count = 0;

        node = get("main > section.post-viewer");

        /** @type {{ [s: string]: HTMLElement }} */
        _nodes = {
            container: null,
            titleSpan: null,
            message: null,
            input: null,
            button: null,
            commentsBox: null
        }

        /** @type {string} */
        _currentPostId = null;

        /** @type {(() => any)[]} */
        _listenerKillers = [];

        constructor() {
            this.node.innerHTML = `
                <span class="material-icons-outlined">close</span>
                <div class="content">
                    <h1 class="title">comments to post by <span>ME</span></h1>
                    <p class="message">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam, laboriosam.</p>
                    <form action="javascript:void(0)" class="input">
                        <input type="text" placeholder="write a comment">
                        <button>
                            <span class="material-icons-outlined">send</span>
                        </button>
                    </form>
                    <div class="comments"></div>
                </div>
            `;

            this._nodes.container = get(this.node, "div.content");
            this._nodes.titleSpan = get(this._nodes.container, "h1.title > span");
            this._nodes.message = get(this._nodes.container, "p.message");
            this._nodes.input = get(this._nodes.container, "form > input");
            this._nodes.button = get(this._nodes.container, "form > button");
            this._nodes.commentsBox = get(this._nodes.container, "div.comments");

            this.node.addEventListener('click', () => this.close());
            this._nodes.container.addEventListener('click', e => e.stopPropagation());
            this._nodes.button.addEventListener('click', () => {
                if (!this._currentPostId)
                    return;
                
                const msg = (this._nodes.input.value || "").trim();
                if (!msg)
                    return;

                this._nodes.input.value = null;
                APP.createComment(this._currentPostId, msg);
            });
        }

        /**
         * Empties the comments box.
         * @returns {void} Nothing
         */
        emptyComments() {
            this._nodes.commentsBox.innerHTML = `<p>you will be the first to comment!</p>`;
        }

        /**
         * Shows/hides the post viewer
         * @param {boolean} [hide = true] whether or not to hide the editor
         */
         _toggle(hide = true) {
            this.node.classList[hide ? "add" : "remove"]("hidden");
            MODALS_SVC[hide ? "removeModal" : "logModal"](this.id);
            this.killListeners();
        }

        /**
         * Adds a killer function to memory.
         * @param {BehaviorSubject} $subject the subject to command
         * @param {string} id the id of the listener
         * @returns {void} Nothing
         */
        logKiller($subject, id) {
            this._listenerKillers.push(() => $subject.unsubscribe(id));
        }

        /**
         * Kills all active listeners.
         * @returns {void} Nothing
         */
        killListeners() {
            while (this._listenerKillers.length) {
                this._listenerKillers[0]();
                this._listenerKillers.splice(0, 1);
            }
        }

        /**
         * Opens a post using its ID.
         * @param {string} postId the id of the post to open
         * @returns {void} Nothing
         */
        open(postId) {
            this._toggle(false);
            this._currentPostId = postId;
            
            const post = APP.getPost(postId);

            let authorLogged = false;
            post.$author.subscribe((val, id) => {
                if (!authorLogged) {
                    this.logKiller(post.$author, id);
                    authorLogged = true;
                }

                if (!val)
                    return;
                
                this._nodes.titleSpan.innerText = val.name ?? "NAME";
            });

            let postMessageLogged = false;
            post.$message.subscribe((val, id) => {
                if (!postMessageLogged) {
                    this.logKiller(post.$message, id);
                    postMessageLogged = true;
                }

                if (!val)
                    return;
                
                this._nodes.message.innerText = val ?? "MESSAGE";
            });

            let $commentsLogged = false;
            post.$comments.subscribe((val, id) => {
                if (!$commentsLogged) {
                    this.logKiller(post.$comments, id);
                    $commentsLogged = true;
                }

                this.emptyComments();
                if (!APP._isDefined(val))
                    return;

                for (const comment of val) {
                    if (!comment)
                        return;

                    const node = document.createElement("div");
                    node.classList.add("comment");
                    node.innerHTML = `
                        <div class="pic color">
                            <img src="" alt="profile pic">
                            <div class="filler" style="--color: white"></div>
                        </div>
                        <div class="name">
                            <p>John Doe</p>
                            <p class="edited">
                                <span datetime="0">just now</span>
                                <span datetime="0">just now</span>
                            </p>
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ad, non?</p>
                        </div>
                    `;

                    const divPic = get(node, "div.pic");
                    const divPicImg = get(divPic, "img");
                    const divPicFiller = get(divPic, "div.filler");
                    const pName = get(node, "div.name > p:first-of-type");

                    let urlLogged = false;
                    comment.author.$url.subscribe((url, id) => {
                        if (!urlLogged) {
                            this.logKiller(comment.author.$url, id);
                            urlLogged = true;
                        }
                        if (APP._isDefined(url)) {
                            divPicImg.src = url;
                            divPic.classList.remove("color");
                        } else
                            divPic.classList.add("color");
                    });

                    let colorLogged = false;
                    comment.author.$color.subscribe((color, id) => {
                        if (!colorLogged) {
                            this.logKiller(comment.author.$color, id);
                            colorLogged = true;
                        }
                        divPicFiller.setAttribute("style", `--color: ${color}`);
                    });

                    let nameLogged = false;
                    comment.author.$name.subscribe((name, id) => {
                        if (!nameLogged) {
                            this.logKiller(comment.author.$name, id);
                            nameLogged = true;
                        }
                        pName.innerText = name;
                    });

                    let [created, updated] = [0, 0];
                    const pTime = get(node, "div.name > p:nth-of-type(2)");
                    const pTimeCreated = get(pTime, "span:first-of-type");
                    const pTimeUpdated = get(pTime, "span:last-of-type");
                    const updateTimeUI = () => {
                        pTime.classList[created === updated ? "remove" : "add"]("edited");
                        pTimeCreated.setAttribute("datetime", created);
                        pTimeUpdated.setAttribute("datetime", updated);
                        timeago.render([pTimeCreated, pTimeUpdated], 'zn_US');
                    }
                    updateTimeUI();

                    let createdLogged = false;
                    comment.$created.subscribe((stamp, id) => {
                        if (!createdLogged) {
                            this.logKiller(comment.$created, id);
                            createdLogged = true;
                        }

                        if (!APP._isDefined(stamp))
                            return;
                        
                        created = stamp;
                        updateTimeUI();
                    });

                    let updatedLogged = false;
                    comment.$updated.subscribe((stamp, id) => {
                        if (!updatedLogged) {
                            this.logKiller(comment.$updated, id);
                            updatedLogged = true;
                        }

                        if (!APP._isDefined(stamp))
                            return;
                        
                        updated = stamp;
                        updateTimeUI();
                    });
                    
                    const pContent = get(node, "div.name > p:last-of-type");
                    let messageLogged = false;
                    comment.$message.subscribe((msg, id) => {
                        if (!messageLogged) {
                            this.logKiller(comment.$message, id);
                            messageLogged = true;
                        }

                        pContent.innerText = msg ?? "[DEFAULT: NO MESSAGE]";
                    });
                    
                    this._nodes.commentsBox.prepend(node);
                }
            });
        }

        /**
         * Closes the editor
         * @returns {void} Nothing
         */
        close() {
            this._toggle();
        }

    }();

    /**
     * Creates a post node that can be appended to the feed using the post id
     * @param {string} id the id of the post
     * @returns {HTMLElement} the node of the post
     */
    const createPostNode = (postId) => {
        const post = APP.getPost(postId);

        const node = document.createElement("div");
        node.setAttribute("id", postId);
        node.classList.add("post");
        node.innerHTML = `
            <div class="header">
                <div class="pic color">
                    <img src="" alt="profile pic">
                    <div class="filler" style="--color: white"></div>
                </div>
                <div class="name">
                    <p>John Doe</p>
                    <p class="edited">
                        <span datetime="0">just now</span>
                        <span datetime="0">just now</span>
                    </p>
                </div>
            </div>
            <div class="content no-image">
                <p></p>
                <img src="" alt="GIF">
            </div>
            <div class="action">
                <div class="likes">
                    <div>
                        <span class="material-icons-outlined">thumb_up</span>
                        <span class="material-icons">thumb_up</span>
                        <span>0</span>
                    </div>
                </div>
                <div class="buttons">
                    <button class="edit-btn">edit</button>
                    <button>comment</button>
                </div>
            </div>
        `;

        let editable = false;
        const divButtons = get(node, "div.action > div.buttons");
        const divButtonsComment = get(divButtons, "button:not(.edit-btn)");
        divButtonsComment.addEventListener('click', () => POST_VIEWER.open(postId));


        const divPic = get(node, "div.header > div.pic");
        const divPicImg = get(divPic, "img");
        const divPicFiller = get(divPic, "div.filler");
        const pName = get(node, "div.header > div.name > p:first-of-type");
        post.$author.subscribe(data => {
            if (!data)
                return;
            
            if (data.url && data.url.length) {
                divPicImg.src = data.url;
                divPic.classList.remove("color");
            } else
                divPic.classList.add("color");

            divPicFiller.setAttribute("style", `--color: ${data.color}`);
            pName.innerText = data.name;

            editable = data.id === user.uid;
            divButtons.classList[editable ? "add" : "remove"]("editable");
        });

        let [created, updated] = [0, 0];
        const pTime = get(node, "div.header > div.name > p:last-of-type");
        const pTimeCreated = get(pTime, "span:first-of-type");
        const pTimeUpdated = get(pTime, "span:last-of-type");
        const updateTimeUI = () => {
            pTime.classList[created === updated ? "remove" : "add"]("edited");
            pTimeCreated.setAttribute("datetime", created);
            pTimeUpdated.setAttribute("datetime", updated);
            timeago.render([pTimeCreated, pTimeUpdated], 'zn_US');
        }
        updateTimeUI();
        post.$created.subscribe(stamp => {
            if (!APP._isDefined(stamp))
                return;
            created = stamp;
            updateTimeUI();
        });
        post.$updated.subscribe(stamp => {
            if (!APP._isDefined(stamp))
                return;
            updated = stamp;
            updateTimeUI();
        });

        const CACHE = {
            id: postId,
            message: "",
            gif: ""
        }

        const divContent = get(node, "div.content");
        const divContentP = get(divContent, "p");
        const divContentImg = get(divContent, "img");
        post.$message.subscribe(msg => {
            divContentP.innerText = msg ?? "[DEFAULT: NO MESSAGE]";
            CACHE.message = msg || "";
        });
        post.$gif.subscribe(url => {
            if (!APP._isDefined(url) || !url.length || !REGEXES.url.test(url)) {
                CACHE.gif = "";
                return divContent.classList.add("no-image");
            }
            divContentImg.src = url;
            CACHE.gif = url;
            divContent.classList.remove("no-image");
        });

        let liked = false;
        const divLike = get(node, "div.action > div.likes > div");
        const divLikeCount = get(divLike, "span:last-of-type");
        const updateLikeUI = () => divLike.classList[liked ? "remove" : "add"]("likable");
        updateLikeUI();
        divLike.addEventListener('click', () => APP[liked ? "hatePost" : "likePost"](postId));
        post.$likes.subscribe(data => {
            if (!data)
                return;
            liked = data.liked;
            divLikeCount.innerText = data.count;
            updateLikeUI();
        });

        const divButtonsEdit = get(divButtons, "button.edit-btn");
        divButtonsEdit.addEventListener('click', () => {
            if (!editable)
                return;
            POST_EDITOR.editOpen(
                CACHE.id,
                CACHE.message,
                CACHE.gif
            );
        });

        return node;
    }

    // latch on the create post button
    const CREATE_POST_NODE = get("main > section.content > div.posts > div.editor > button");
    CREATE_POST_NODE.addEventListener('click', () => POST_EDITOR.cleanOpen());
    
    // get all posts ordered by their creation timestamp
    const FEED_NODE = get("main > section.content > div.posts > div.feed");
    FEED_NODE.innerHTML = null;
    DB.ref("/posts").orderByChild("meta/created")
        .on("child_added", snap => FEED_NODE.appendChild(createPostNode(snap.key)));

    /**
     * Creates a node for a friend of the current user
     * @param {string} friendId the id of the friend
     * @returns {HTMLElement} the node
     */
    const createFriendNode = (friendId) => {
        const node = document.createElement("div");
        node.innerHTML = `
            <div class="pic color">
                <img src="" alt="profile pic">
                <div class="filler" style="--color: white"></div>
            </div>
            <div class="name">
                <p>NAME</p>
            </div>
        `;

        const divPic = get(node, "div.pic");
        const divPicImg = get(divPic, "img");
        const divPicFiller = get(divPic, "div.filler");
        const pName = get(node, "div.name");

        APP.lookupUser(friendId, data => {
            if (data.url && data.url.length) {
                divPicImg.src = data.url;
                divPic.classList.remove("color");
            } else
                divPic.classList.add("color");
    
            divPicFiller.setAttribute("style", `--color: ${data.color}`);
            pName.innerText = data.name;
        });

        return node;
    }

    // get all friends
    const FRIEND_NODE = get("main > section.content > div.friends > div.box > div");
    DB.ref(`/users/${user.uid}/friends`).on('child_added', snap => FRIEND_NODE.appendChild(createFriendNode(snap.key)));
}, false);