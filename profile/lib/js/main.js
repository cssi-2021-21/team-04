console.log("script running.");

// # FIREBASE
firebase.initializeApp({
    apiKey: "AIzaSyBJxja4Sd-os7iEiIOHpwtj0VgDtmUUO-0",
    authDomain: "cssi-2021-team-04.firebaseapp.com",
    projectId: "cssi-2021-team-04",
    storageBucket: "cssi-2021-team-04.appspot.com",
    messagingSenderId: "572149620254",
    appId: "1:572149620254:web:e4f78ac7128d8d713cd80f"
});

const activities = {
    "walk":4,
    "run":11,
    "treadmill":10,
    "hiking":8,
    "cycling":10,
    "elliptical":11,
    "stair-climber":10,
    "swim":12,
};

for (let activity in activities) {
    console.log(activity);
    let optionEx = document.createElement("option");
    optionEx.value = activity;
    optionEx.text = activity.charAt(0).toUpperCase() + activity.substr(1).toLowerCase();
    document.querySelector("#exercise").appendChild(optionEx);
}


//#region Charts
//We just have to update the data to change everything; When FB is set up
const data = {
    labels: ['7/23', '7/24', '7/25', '7/26', '7/27', '7/28'],
        datasets: [{
            label: '# of Calories',
            data: [2452, 3113, 1913, 2642, 2490, 2309],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
}


//Actual Charts
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: data.labels,
        datasets: [{
            label: data.datasets[0].label,
            data: data.datasets[0].data,
            backgroundColor: data.datasets[0].backgroundColor,
            borderColor: data.datasets[0].borderColor,
            borderWidth: data.datasets[0].borderWidth
        }]
    },
    options: {
        layout: {
        padding: 100
        }
    }
});

var ctx = document.getElementById('myChart2').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: data.labels,
        datasets: [{
            label: data.datasets[0].label,
            data: data.datasets[0].data,
            backgroundColor: data.datasets[0].backgroundColor,
            borderColor: data.datasets[0].borderColor,
            borderWidth: data.datasets[0].borderWidth
        }]
    },
    options: {
        layout: {
        padding: 100
        }
    }
});


//Remove Bar Graph onresize || When it's less than 1100 
window.onresize = () => {
    if (window.innerWidth <= 1100){
        const ctx = document.getElementById('barChartDiv');
        ctx.style.display = "none"
        const navBuffer = document.querySelector('#navBuffer');
        navBuffer.style.display = "none"
    } else {
        const ctx = document.getElementById('barChartDiv');
        ctx.style.display = "block"
        const navBuffer = document.querySelector('#navBuffer');
        navBuffer.style.display = "block"
    }
}

//#region Modal stuff
const modal = document.querySelector("#modal")
modal.style.display = "none"
const phoneAlert = document.querySelector("#phoneAlert")
phoneAlert.style.display = "none"
const deleteAccModal = document.querySelector("#deleteAccModal")
deleteAccModal.style.display = "none"


if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    // Make modal Appear to warn people
    const modal = document.querySelector("#modal")
    modal.style.display = "grid"
    const phoneAlert = document.querySelector("#phoneAlert")
    phoneAlert.style.display = "block"
    document.documentElement.style.overflow = "hidden";
    document.body.scroll = "no"
}

const closePhoneAlertBtn = document.querySelector("#closeAlertBtn")
closePhoneAlertBtn.addEventListener('click', () => {
    const modal = document.querySelector("#modal")
    modal.style.display = "none"
})

//For Account deletion
const deleteAccBtn = document.querySelector("#deleteAcc");
deleteAccBtn.addEventListener('click', () => {
    const modal = document.querySelector("#modal")
    modal.style.display = "grid"
    const deleteAccModal = document.querySelector("#deleteAccModal")
    deleteAccModal.style.display = "block"
})

const confirmDelete = document.querySelector("#confirmDelete");
confirmDelete.addEventListener('click', e => {
    const modal = document.querySelector("#modal")
    modal.style.display = "none"
    const deleteAccModal = document.querySelector("#deleteAccModal")
    deleteAccModal.style.display = "none"
})

//#endregion


//#region Workout Card|| Ideally we refresh it per day
const workoutNoPlan = document.querySelector("#noPlan")
workoutNoPlan.style.display = "none"
//#endregion