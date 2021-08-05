const container = document.querySelector("#havePlan");
const friendList = document.querySelector("#friendList");
const submitExercise = document.querySelector("#submitExercise");
const exercise = document.querySelector("#exercise");
const duration = document.querySelector("#duration");
const editExercise = document.querySelector("#editExercise");
const editDuration = document.querySelector("#editDuration");


const updateProfile = (user) => {
  const profileName = document.querySelectorAll(".profileName");

  const dateJoin = document.querySelector("#dateJoin");
  const profileEmail = document.querySelector("#profileEmail");

  profileName.forEach(e=>e.innerHTML=user.displayName);
  const dateJoinObj = new Date(parseInt(user.metadata.a));
  dateJoin.innerHTML = dateJoinObj.getMonth()+1+"/"+dateJoinObj.getDate()+"/"+dateJoinObj.getFullYear();
  profileEmail.innerHTML = user.email;
}

const getFriendList = (data) => {
  let domTemplate = '';
  for(const friendID in data){
    APP.lookupUser(friendID,(data)=>{
      domTemplate+=`
      <div class="friends" >
        <img src="${data.url}" class="offline">
        <div>
            <h2> ${data.name} </h2>
            <hr>
            <p> Hello </p>
        </div>
      </div>
        `
    })
  };
  friendList.innerHTML = domTemplate;
}

const renderHTML = (data) => {
  let domTemplate = '';
  for(const exerciseData in data){
    let exerciseObj = data[exerciseData];
    //Profile exercise template
    const workoutDate = new Date(exerciseObj.timestamp);
    domTemplate+=`
      <div class="workout-card">
        <h1> ${exerciseObj.name.charAt(0).toUpperCase() + exerciseObj.name.substr(1).toLowerCase()} </h1>
        <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 7C16.1046 7 17 6.10457 17 5C17 3.89543 16.1046 3 15 3C13.8954 3 13 3.89543 13 5C13 6.10457 13.8954 7 15 7Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12.6133 8.26691L9.30505 12.4021L13.4403 16.5374L11.3727 21.0861" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.4104 9.5075L9.79728 6.19931L12.6132 8.26692L15.508 11.5752H19.2297" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8.89152 15.7103L7.65095 16.5374H4.34277" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h2> ${exerciseObj.duration} minute </h2>
        <h2> ${exerciseObj.calories} calories </h2>
        <h2> ${workoutDate.getMonth()+1+"/"+workoutDate.getDate()+"/"+workoutDate.getFullYear()+", "+workoutDate.getHours()+":"+workoutDate.getMinutes()} </h2>
        <hr>
        <div>
          <button onclick="editWorkout('${exerciseData}')"> Edit </button>
          <button onclick="APP.deleteWorkout('${exerciseData}')"> Delete </button>
        </div>
      </div>
      `
  };
  container.innerHTML = domTemplate;
}
var isEditing;
const editWorkout = (workoutId) => {
  isEditing = true;
  openWorkoutModal(workoutId);
};

let currentWorkoutId;
const openWorkoutModal = (workoutId) => {
  modal.style.display = "grid"
  workoutModal.style.display = "flex"
  if(isEditing){
    currentWorkoutId = workoutId || "";
    APP.registerListener(DEFAULT_TARGETS.userData, (_, data) => {
      if(data){
        let getWorkout = data.workouts[workoutId];
        exercise.value = getWorkout.name;
        duration.value = getWorkout.duration;
      }
    })
  }
}
saveWorkout.addEventListener("click",e=>{
  if(isEditing){
    APP.editWorkout(currentWorkoutId, {name:exercise.value, duration:parseInt(duration.value), calories:activities[exercise.value] * parseInt(duration.value)},(e)=>{
      isEditing = false;
      hideWorkoutModal();
    });
  }else{
    APP.logWorkout(exercise.value, parseInt(duration.value), activities[exercise.value] * parseInt(duration.value), ()=>{hideWorkoutModal();});
  }
});

APP.registerListener(DEFAULT_TARGETS.user, (_,user) => {
  if (user) {
    console.log('Logged in as: ' + user.displayName);
    APP.registerListener(DEFAULT_TARGETS.userData, (_, data) => {if(data) renderHTML(data.workouts)})
    updateProfile(user);
    APP.registerListener(DEFAULT_TARGETS.userData, (_, data) => {if(data) getFriendList(data.friends)})
  }
});