 /* 
1. Get latest coronavirus canada stats
2. Update coronavirus-canada-data.json
3. Make commit and push live
*/

const fs = require('fs');
const axios = require('axios')
const cheerio = require('cheerio')
const { DateTime } = require("luxon")

// Load the note, so we can work with it
let file = fs.readFileSync('src/js/covid19-canada-data.json', 'utf8')

// Convert JSON string into JS object
let obj = JSON.parse(file);

// Get current date, as YYYY-MM-DD
// This takes into account the Vancouver (home) timezone.
// 1) Get UTC time as ISO string
// 2) Get current timezone
// 3) Use Luxon to get current date, adjusted by timezonie, in YYYY-MM-DD format 
let today_UTC = new Date().toISOString()
let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
let today_YVR = DateTime.fromISO(today_UTC, { zone: timezone }).toISODate()

// Check if today's stats are already recorded in the JSON. 
// We don't want to overwrite them
// if (obj.hasOwnProperty(today_YVR)) {
//   console.log("Today's stats already recorded")
//   return
// }

// The URL to grab
const url = 'https://www.canada.ca/en/public-health/services/diseases/2019-novel-coronavirus-infection.html'

axios(url)
  .then(response => {

    // Stub out a new `latest` object with empty values
    let latest = {
      bc: 0,
      ab: 0,
      sk: 0,
      mb: 0,
      on: 0,
      qc: 0,
      nl: 0,
      nb: 0,
      ns: 0,
      pe: 0,
      yt: 0,
      nt: 0,
      nu: 0,
      rpt: 0
    }

    // Parse the html and grab the table rows
    const html = response.data
    const $ = cheerio.load(html)
    const stats = $('h2#a1 + table tbody tr')

    // Populate `latest` with data from table rows
    stats.each(function () {

      // Get province name from first td. E.g. "Quebec"
      let province = $(this).find('td').first().text()

      // Remove extra spaces (if they exist) from the province name
      // These extra spaces started appearing Mar 21. Doesn't seem to be in the page source, so I think it's a coming from Cheerio.
      province = province.replace(/\s+/gm, ' ')
      
      // Get the confirmed cases figure from the second td
      const confirmed = parseInt($(this).find('td').eq(1).text())

      // Assign the confirmed cases figure to the corresponding `latest` key
      switch (province) {
        case 'British Columbia':
          latest.bc = confirmed
          break
        case 'Alberta':
          latest.ab = confirmed
          break
        case 'Saskatchewan':
          latest.sk = confirmed
          break
        case 'Manitoba':
          latest.mb = confirmed
          break
        case 'Ontario':
          latest.on = confirmed
          break
        case 'Quebec':
          latest.qc = confirmed
          break
        case 'Newfoundland and Labrador':
          latest.nl = confirmed
          break
        case 'New Brunswick':
          latest.nb = confirmed
          break
        case 'Nova Scotia':
          latest.ns = confirmed
          break
        case 'Prince Edward Island':
          latest.pe = confirmed
          break
        case 'Yukon':
          latest.yt = confirmed
          break
        case 'Northwest Territories':
          latest.nt = confirmed
          break
        case 'Nunavut':
          latest.nu = confirmed
          break
        case 'Repatriated travellers':
          latest.rpt = confirmed
          break
      }
    })

    // Delete `latest` provinces that are zero
    // Object.keys(latest).forEach((item) => {
    //   let key = item
    //   let value = latest[item]
    //   if (value == 0) delete latest[key]
    // })

    // Add `latest` to the JS object
    obj[today_YVR] = latest

    let json = JSON.stringify(obj, null, 2);

    fs.writeFile('src/js/covid19-canada-data.json', json, 'utf8', complete);

  })
  .catch(console.error)

function complete() {
  // console.log("success")
}