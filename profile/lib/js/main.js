console.log("script running.");

// # FIREBASE
firebase.initializeApp({
    apiKey: "AIzaSyAfKeoAG7eiRzWQlKtyG_1mrb375wclXW8",
    authDomain: "cssi-2021-21-team-04.firebaseapp.com",
    projectId: "cssi-2021-21-team-04",
    storageBucket: "cssi-2021-21-team-04.appspot.com",
    messagingSenderId: "691973782453",
    appId: "1:691973782453:web:f2748f5aa67bdbd35ff7fc"
});


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
    } else {
        const ctx = document.getElementById('barChartDiv');
        ctx.style.display = "block"
    }
}

//#endregion