const container = document.querySelector("#profileContainer")
const notesRef = firebase.database().ref();
  notesRef.on('value', (snapshot) => {
  const data = snapshot.val();
  renderHTML(data);
});

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
