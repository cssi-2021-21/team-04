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

        
        const post = APP.getPost(postID);
        console.log(post)
        
        post.$created.subscribe((data)=>{
          if(data){
            let date = new Date();
            postDate.innerHTML = date.getMonth()+1+"/"+date.getDate()+"/"+date.getFullYear();
          }
        })
        post.$author.subscribe((data)=>{
          if(data){
            posterImg.src = data.url;
            posterName.innerHTML=data.name;
          }
        });
        post.$message.subscribe((data)=>{
          if(data){
            postWord.innerHTML = data;
          }
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