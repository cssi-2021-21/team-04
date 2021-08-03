const container = document.querySelector("#profileContainer")
let userId;

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
  const workouts = firebase.database().ref(`users/${userId}/workouts`);
    workouts.on('value', (snapshot) => {
    const data = snapshot.val();
    console.log(data);
    renderHTML(data);
  });  
}

const renderHTML = (data) => {
  let domTemplate = '';
  for(const exerciseData in data){
    let exerciseObj = data[exerciseData];
    console.log(exerciseObj);
    //Profile exercise template
    domTemplate+=`
      <div class="workoutCard">
        <p>${exerciseObj.duration} minute ${exerciseObj.exercise.charAt(0).toUpperCase() + exerciseObj.exercise.substr(1).toLowerCase()}</p>
        <p>You burned ${exerciseObj.calories} calories!</p>
        <p>${new Date(exerciseObj.dateTime)}</p>
      </div>
    `
  };
  container.innerHTML = domTemplate;
}
