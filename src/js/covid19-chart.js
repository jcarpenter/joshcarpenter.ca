import ApexCharts from './third-party/apexcharts.esm.js'

function fetch_stats() {
  fetch("../../js/covid19-canada-data.json")
    .then(response => {

      if (!response.ok) {
        throw new Error('Network response was not ok. Failed to load data.');
      }

      return response.json()
    })
    .then(json => drawChart(json));
}

function drawChart(stats) {

  let options = {

    chart: {
      type: 'bar',
      height: 364, // 14 * 26px grid size
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
      fontFamily: '"Public Sans", sans-serif'
    },

    series: [{
      name: 'BC',
      data: []
    }, {
      name: 'AB',
      data: []
    }, {
      name: 'SK',
      data: []
    }, {
      name: 'MB',
      data: []
    }, {
      name: 'ON',
      data: []
    }, {
      name: 'QC',
      data: []
    }, {
      name: 'NL',
      data: []
    }, {
      name: 'NB',
      data: []
    }, {
      name: 'NS',
      data: []
    }, {
      name: 'PE',
      data: []
    }, {
      name: 'YT',
      data: []
    }, {
      name: 'NT',
      data: []
    }, {
      name: 'NU',
      data: []
    }, {
      name: 'RPT',
      data: []
    }],

    // colors:[
    //   '#4E68AD', '#D64F3E', '#00948D', '#F0B947', '#A6003E'
    // ],

    // "The DateTime String which you provide should return true when parsed through JavaScript’s Date.parse() function"
    // Docs: https://apexcharts.com/docs/series/
    xaxis: {
      type: 'datetime',
      // labels: {
      //   rotate: -45
      // },
      categories: [],
    },

    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetX: 14,
          offsetY: 0
        }
      }
    }],

    // Hide data labels
    // Docs: https://apexcharts.com/docs/datalabels/
    dataLabels: {
      enabled: false
    },

    plotOptions: {
      bar: {
        horizontal: false,
      },
    },

    legend: {
      position: 'bottom',
      offsetY: 14,
      fontSize: '12px',
      itemMargin: {
        horizontal: 3,
        vertical: 10
      },
    },

    fill: {
      opacity: 1
    }

  }

  Object.keys(stats).forEach((date) => {

    let figures_for_date = stats[date]

    options.xaxis.categories.push(date)

    for (let i = 0; i < options.series.length; i++) {
      
      let prov = options.series[i].name.toLowerCase()
      let data = options.series[i].data
      
      data.push(figures_for_date[prov])

    }

    // console.log(options.series)

  })

  const chart = new ApexCharts(document.getElementById('covid19-cases-canada'), options)

  chart.render()

}

window.addEventListener('load', fetch_stats)
