const container = document.querySelector("#profileContainer")
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    console.log('Logged in as: ' + user.displayName);
    userId = user.uid;
    getExercises(userId);
  } else {
    // If not logged in, navigate back to login page.
    window.location = '/index.html';
  };
});

const getExercises = (userId) => {
  const notesRef = firebase.database().ref(`users/${userId}`);
    notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    console.log(data);
  });  
}

const renderHTML = (data) => {
  let domTemplate = '';
  for(const exerciseData in data){
    let exerciseObj = data[exerciseData];
    console.log(exerciseObj);
    //Profile exercise template
    domTemplate+=`
      <div>
        <p>Exercise: ${exerciseObj.exercise}</p>
        <p>Duration: ${exerciseObj.duration}</p>
      </div>
    `
  };
  container.innerHTML = domTemplate;
}
