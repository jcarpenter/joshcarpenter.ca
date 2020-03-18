// import Chart from 'Chart.min.js';

(function (window, document) {
  'use strict'


  function setup() {

    let article = document.body.querySelector('article')
    let chartCanvas = document.createElement('canvas')
    chartCanvas.id = 'myChart'
    article.appendChild(chartCanvas)

    // let ctx = document.getElementById('myChart')

    // let myChart = new Chart(chartCanvas, {
    //   type: 'bar',
    //   data: {
    //     labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    //     datasets: [{
    //       label: '# of Votes',
    //       data: [12, 19, 3, 5, 2, 3],
    //       backgroundColor: [
    //         'rgba(255, 99, 132, 0.2)',
    //         'rgba(54, 162, 235, 0.2)',
    //         'rgba(255, 206, 86, 0.2)',
    //         'rgba(75, 192, 192, 0.2)',
    //         'rgba(153, 102, 255, 0.2)',
    //         'rgba(255, 159, 64, 0.2)'
    //       ],
    //       borderColor: [
    //         'rgba(255, 99, 132, 1)',
    //         'rgba(54, 162, 235, 1)',
    //         'rgba(255, 206, 86, 1)',
    //         'rgba(75, 192, 192, 1)',
    //         'rgba(153, 102, 255, 1)',
    //         'rgba(255, 159, 64, 1)'
    //       ],
    //       borderWidth: 1
    //     }]
    //   },
    //   options: {
    //     scales: {
    //       yAxes: [{
    //         ticks: {
    //           beginAtZero: true
    //         }
    //       }]
    //     }
    //   }
    // })

  }

  //Fix once on first page load
  window.addEventListener('load', setup)

}(window, document))
