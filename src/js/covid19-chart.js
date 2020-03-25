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

      labels: {
        show: true,
        rotate: -90,
        rotateAlways: true,
        hideOverlappingLabels: false,
        minHeight: 50,
        maxHeight: 140,
        format: 'MM / dd',
        // tickAmount: 'dataPoints',
        // tickPlacement: 'on',
        // range: '20',
        style: {
          colors: ['#676767'],
          fontSize: '10px',
        },
        offsetX: 0,
        offsetY: -4,
      },

      categories: [],
    },

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
      position: 'right',
      offsetY: 16,
      // height: 60,
      fontSize: '12px',
      inverseOrder: true,
      itemMargin: {
        horizontal: 0,
        vertical: 0
      },
      markers: {
        width: 10,
        height: 10,
        // offsetY: -4,
        radius: 1,
      },
      onItemClick: {
        toggleDataSeries: true
      },
    },

    fill: {
      opacity: 1
    },

    responsive: [{
      breakpoint: 680,
      options: {
        chart: {
          height: 312, // 14 * 26px grid size
        },
        legend: {
          // width: 50,
          offsetY: 8,
          markers: {
            // width: 10,
            // height: 10,
            // offsetY: -4,
            // radius: 1,
          },
          itemMargin: {
            horizontal: 0,
            vertical: -2
          },
        }
      }
    }]

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
