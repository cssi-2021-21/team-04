let userId;
const postSection = document.querySelector(".postSection");

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    console.log('Logged in as: ' + user.displayName);
    userId = user.uid;
    getPosts(userId);
  } else {
    // If not logged in, navigate back to login page.
    window.location = '/index.html';
  };
});

const getPosts = () => {
  const posts = firebase.database().ref(`posts`);
    posts.on('value', (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      postSection.innerHTML="";
      for(let postID in data){
        const postDiv = document.createElement("div");
        postDiv.classList.add("post")
        const posterDiv = document.createElement("div");
        const posterImg = document.createElement("img");
        const posterName = document.createElement("h1");
        const postDate = document.createElement("p");
        const postWordDiv = document.createElement("div");
        postWordDiv.classList.add("postWord")
        const postWord = document.createElement("p");

        posterDiv.appendChild(posterImg);
        posterDiv.appendChild(posterName);
        posterDiv.appendChild(postDate);
        postWordDiv.appendChild(postWord);
        postDiv.appendChild(posterDiv);
        postDiv.appendChild(postWordDiv);
        postSection.appendChild(postDiv);

        let post = APP.getPost(postID);
        post.$message.subscribe((data)=>{
          console.log(data);
          postWord.innerHTML = data;
        })
        // console.log(APP.user)
        // console.log(APP.lookupUser("yhUZsrVIkhM0DQEUyPeIjak3dAq1",(data)=>{console.log(data)}))
        // console.log(APP.removeFriend("XL8oDhmIBMR6lU41pqPhrwz7ejt1"))
        // console.log(APP.logWorkout("running",12,110,(id)=>console.log(id)))
        // console.log(APP.updateUserInfo())
      }
      // renderHTML(data);
  });  
}