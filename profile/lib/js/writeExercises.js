const submitExercise = document.querySelector("#submitExercise");
const exercise = document.querySelector("#exercise");
const duration = document.querySelector("#duration");



submitExercise.addEventListener("click",e=>{
  APP.logWorkout(exercise.value, duration.value, activities[exercise.value] * parseInt(duration.value), (id)=>{console.log(id)})
})