/**
 * weather route uses openweathermaps to retrieve weather information, endpoints:
 * - weather/city
 * - weather/lat/long
 * - weather/forecast/lat/long
 */

const express = require('express');
const request = require('request');
const router = express.Router();

// openweathermaps api credentials
const CLIENT_ID = '61005c04e2164479f6b4fa8e51cb8535';

/**
 * get weather by city
 */
router.get('/:city', function (req, res) {
  const { city } = req.params;
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${CLIENT_ID}`

  request(url, function (err, response, body) {
    if(err) {
      console.log("Error getting weather information from city")
      res.send("error");
    } 
    else {
      let result = JSON.parse(body);
      if(result.cod !== 200) {
        console.log("Error: city is invalid")
        res.send("Invalid city")
      } 
      else {
        let output = {
          index: 0,
          lat: result.coord.lat,
          long: result.coord.lon,
          city: result.name,
          country: result.sys.country,
          id: result.weather[0].id,
          iconCode: result.weather[0].icon,
          main: result.weather[0].main,
          description: result.weather[0].description,
          clouds: result.clouds.all,
          temp: result.main.temp + "°C"
        }
        res.send(output)
      } 
    }
  });
})

/**
 * get weather by latitude and longitute coordinates
 */
router.get('/:lat/:long', function (req, res) {
  const { long, lat } = req.params;

  let url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${CLIENT_ID}`;
  
  request(url, function (err, response, body) {
    if(err) {
      console.log("Error getting weather information from coordinates")
      res.send("error");
    } 
    else {
      let result = JSON.parse(body);
      if(result.cod !== 200) {
        console.log("Error: coordinates are invalid")
        res.send("Invalid coordinates")
      } 
      else {
        let output = {
          index: 0,
          city: (result.name) ? result.name : "Unknown City",
          country: (result.sys.country) ? result.sys.country : "",
          id: result.weather[0].id,
          iconCode: result.weather[0].icon,
          main: result.weather[0].main,
          description: result.weather[0].description,
          clouds: result.clouds.all,
          temp: result.main.temp + "°C"
        }
        res.send(output)
      } 
    }
  });
})

/**
 * get weather forecast of latitude and longitute coordinates
 */
router.get('/forecast/:lat/:long', function (req, res) {
  const { lat, long } = req.params;

  let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&%20exclude=hourly,daily&units=metric&appid=${CLIENT_ID}`

  request(url, function (err, response, body) {
    if(err) {
      console.log("Error getting weather forecast from coordinates")
      res.send("Error getting weather forecast from coordinates");
    } 
    else {
      let result = JSON.parse(body);
      let forecast = getForecast(result.daily)
      res.send(forecast);
    }
  });
});

/****************************** HELPER FUNCTIONS ******************************/
/**
 * returns array of weather information for the next 7 days
 * @param {*} daily: json array returned by forecast api call
 */
function getForecast(daily){
  let forecast = [];

  daily.forEach((day, i) => {
    // skip current forecast
    if(i != 0) {
      forecast.push({
        date: unixToDate(day.dt),
        temp: day.temp.day + "°C",
        id: day.weather[0].id,
        main: day.weather[0].main,
        description: day.weather[0].description,
        iconCode: day.weather[0].icon,
        clouds: day.clouds
      })
    }
  })

  return forecast;
}

/**
 * converts unix timestamp to date DD MMM
 */
function unixToDate(unixTime) {
  let newDate = new Date(unixTime * 1000);
  let fullDate = newDate.toUTCString().split(" ");   //Thu, 10 Sep 2020 18:00:00 GMT
  
  return(`${fullDate[0].split(',')[0]} ${fullDate[1]} ${fullDate[2]}`);

}

module.exports = router;