const container = document.querySelector("#havePlan")
let userId;

const updateProfile = (user) => {
  const profileName = document.querySelector("#profileName")
  const profileDate = document.querySelector("#profileDate")
  console.log(user)
}
const getExercises = (userId) => {
  APP.registerListener(DEFAULT_TARGETS.userData,(_, data) => {if(data) renderHTML(data.workouts)})
}

const renderHTML = (data) => {
  let domTemplate = '';
  for(const exerciseData in data){
    let exerciseObj = data[exerciseData];
    console.log(exerciseObj.name);
    //Profile exercise template
    domTemplate+=`
      <div class="workout-card">
        <h1> ${exerciseObj.name.charAt(0).toUpperCase() + exerciseObj.name.substr(1).toLowerCase()} </h1>
        <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 7C16.1046 7 17 6.10457 17 5C17 3.89543 16.1046 3 15 3C13.8954 3 13 3.89543 13 5C13 6.10457 13.8954 7 15 7Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12.6133 8.26691L9.30505 12.4021L13.4403 16.5374L11.3727 21.0861" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.4104 9.5075L9.79728 6.19931L12.6132 8.26692L15.508 11.5752H19.2297" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8.89152 15.7103L7.65095 16.5374H4.34277" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h2> ${exerciseObj.duration} </h2>
        <h2> ${exerciseObj.calories} </h2>
        <h2> ${new Date(exerciseObj.timestamp)} </h2>
        <hr>
        <div>
          <button> Edit </button>
          <button> Delete </button>
        </div>
      </div>
      `
  };
  container.innerHTML = domTemplate;
}

APP.registerListener(DEFAULT_TARGETS.user, (_,user) => {
  if (user) {
    console.log('Logged in as: ' + user.displayName);
    userId = user.uid;
    getExercises(userId);
    updateProfile(user);
  }
});