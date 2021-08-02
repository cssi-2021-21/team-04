const submitExercise = document.querySelector("#submitExercise");
const exercise = document.querySelector("#exercise");
const duration = document.querySelector("#duration");

submitExercise.addEventListener("click",e=>{
  //firebase.database().ref().push
  console.log({
    exercise:exercise.value,
    duration:duration.value,
  })
})