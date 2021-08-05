// # FIREBASE


//#region Remove Contacts when move
let fixedClicked = false;

window.onresize = () => {
    if (window.innerWidth <= 1400){
        const ctx = document.getElementById('contacts');
        ctx.style.display = "none"
        let fixedContact = document.querySelector("#contactsFixed")
        let fixedBtn = document.querySelector("#contactsBtn")
        fixedContact.style.display = "block"
        fixedBtn.style.display = "grid"
    } else {
        const ctx = document.getElementById('contacts');
        ctx.style.display = "block"
        let fixedContact = document.querySelector("#contactsFixed")
        let fixedBtn = document.querySelector("#contactsBtn")
        fixedContact.style.display = "none"
        fixedBtn.style.display = "none"
    }
}

//Remove the fixed contacts
const ctx = document.querySelector("#contactsFixed");
ctx.style.display = "none"


//Contacts Btn Move fixed Contacts
    /*
        Disable Scrolling bar
        document.documentElement.style.overflow = "hidden";
        document.body.scroll = "no"

        Enable Scrolling bar
        document.documentElement.style.overflow = "auto";
        document.body.scroll = "yes"
    */
const btn = document.querySelector("#contactsBtn");
btn.style.display = "none"
btn.addEventListener('click', function() {
    if (fixedClicked) {
        let ctx = document.querySelector("#contactsFixed");
        ctx.style.transition = "all ease-out 0.2s"
        ctx.style.transform = "translateX(100%)"
        btn.style.transform = "translateX(0%) rotate(0deg)"
        btn.style.transition = "all ease-out 0.2s"

        // document.documentElement.style.overflow = "auto";
        // document.body.scroll = "yes"
    } else {
        let ctx = document.querySelector("#contactsFixed");
        ctx.style.transition = "all ease-out 0.2s"
        ctx.style.transform = "translateX(0%)"
        btn.style.transform = "translateX(-520%) rotate(180deg)"
        btn.style.transition = "all ease-out 0.2s"
        
        // document.documentElement.style.overflow = "hidden";
        // document.body.scroll = "no"
    }
    fixedClicked = !fixedClicked 
})

//#endregion

//#region Modal
//Hide Modal and Every Component within
const modal = document.querySelector("#modal")
modal.style.display = "none"
const phoneAlert = document.querySelector("#phoneAlert")
phoneAlert.style.display = "none"


const closeAlertBtn = document.querySelectorAll(".closeAlert");
closeAlertBtn.forEach(e=>e.addEventListener('click', () => {
    const modal = document.querySelector("#modal")
    modal.style.display = "none"
}))

const newPost = document.querySelector("#NewPost");
newPost.addEventListener('click', () => {
    modal.style.display = "grid"
})



//#endregion

//#region Check if it's phone

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    // true for mobile device
    const ctx = document.getElementById('contacts');
    ctx.style.display = "none"

    // Make modal Appear to warn people
    const modal = document.querySelector("#modal")
    modal.style.display = "grid"
    const phoneAlert = document.querySelector("#phoneAlert")
    phoneAlert.style.display = "block"

}

//#endregion
document.querySelector("#gifyButton").addEventListener("click",(e)=>{
    document.querySelector("#gify").classList.toggle("hidden");
})
const queryField = document.querySelector("#gifySearch");
const gifySelectionContainer = document.querySelector("#gifySelectionContainer");
document.querySelector("#submitGifySearch").addEventListener("click", (e) => {
    let myKey = 'aov2JJZ0OuN558jFjNBJlgDG7zLF7x4l';
    let topic = encodeURIComponent(queryField.value);
    console.log(topic);
    
    let myQuery = `https://api.giphy.com/v1/gifs/search?api_key=${myKey}&q=${topic}&limit=10`;
    console.log(myQuery);
    
    fetch(myQuery).then(response => response.json()).then(myjson => { 
        gifySelectionContainer.innerHTML = "";
        for (let i = 0; i < 9; i++) {
            let img = document.createElement("img");
            img.classList.add("gifyImage");
            img.src = myjson.data[i].images.original.url
            gifySelectionContainer.appendChild(img);
            img.addEventListener("click", (e)=>{
                document.querySelector("#gifyUrl").value=e.target.src;
                document.querySelectorAll(".selected").forEach(el=>el.classList.remove("selected"));
                e.target.classList.add("selected");
            })
        }
        queryField.value = "";
    })
})