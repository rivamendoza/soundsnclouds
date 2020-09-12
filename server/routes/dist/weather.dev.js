"use strict";

/**
 * weather route uses openweathermaps to retrieve weather information, endpoints:
 * - weather/city
 * - weather/lat/long
 * - weather/forecast/lat/long
 */
var express = require('express');

var request = require('request');

var router = express.Router(); // openweathermaps api credentials

var CLIENT_ID = '61005c04e2164479f6b4fa8e51cb8535';
/**
 * get weather by city
 */

router.get('/:city', function (req, res) {
  var city = req.params.city;
  var url = "https://api.openweathermap.org/data/2.5/weather?q=".concat(city, "&units=metric&appid=").concat(CLIENT_ID);
  request(url, function (err, response, body) {
    var result = JSON.parse(body); // if city is valid

    if (result.cod == 200) {
      var output = {
        index: 0,
        lat: result.coord.lat,
        "long": result.coord.lon,
        city: result.name,
        country: result.sys.country,
        id: result.weather[0].id,
        iconCode: result.weather[0].icon,
        main: result.weather[0].main,
        description: result.weather[0].description,
        clouds: result.clouds.all,
        temp: result.main.temp + "°C"
      };
      res.send(output);
    } else if (result.cod == 404) {
      res.send({
        error: "invalid city"
      });
    } else if (result.cod == 401) {
      res.send({
        error: "invalid API key"
      });
    } else {
      res.send({
        error: "unable to fetch weather information from city"
      });
    }
  });
});
/**
 * get weather by latitude and longitute coordinates
 */

router.get('/:lat/:long', function (req, res) {
  var _req$params = req.params,
      _long = _req$params["long"],
      lat = _req$params.lat;
  var url = "https://api.openweathermap.org/data/2.5/weather?lat=".concat(lat, "&lon=").concat(_long, "&units=metric&appid=").concat(CLIENT_ID);
  request(url, function (err, response, body) {
    var result = JSON.parse(body); // if geolocation is valid

    if (result.cod == 200) {
      var output = {
        index: 0,
        city: result.name ? result.name : "Unknown City",
        country: result.sys.country ? result.sys.country : "",
        id: result.weather[0].id,
        iconCode: result.weather[0].icon,
        main: result.weather[0].main,
        description: result.weather[0].description,
        clouds: result.clouds.all,
        temp: result.main.temp + "°C"
      };
      res.send(output);
    } else if (result.cod == 400) {
      res.send({
        error: "invalid coordinates"
      });
    } else if (result.cod == 401) {
      res.send({
        error: "invalid API key"
      });
    } else {
      res.send({
        error: "unable to fetch weather information from geolocation"
      });
    }
  });
});
/**
 * get weather forecast of latitude and longitute coordinates
 */

router.get('/forecast/:lat/:long', function (req, res) {
  var _req$params2 = req.params,
      lat = _req$params2.lat,
      _long2 = _req$params2["long"];
  var url = "https://api.openweathermap.org/data/2.5/onecall?lat=".concat(lat, "&lon=").concat(_long2, "&%20exclude=hourly,daily&units=metric&appid=").concat(CLIENT_ID);
  request(url, function (err, response, body) {
    var result = JSON.parse(body); // if geolocation is invalid there will be a result.cod attribute

    if (result.cod == 400) {
      res.send({
        error: "invalid coordinates"
      });
    } else if (result.cod == 401) {
      res.send({
        error: "invalid API key"
      });
    } else {
      var forecast = getForecast(result.daily);
      res.send(forecast);
    }
  });
});
/****************************** HELPER FUNCTIONS ******************************/

/**
 * returns array of weather information for the next 7 days
 * @param {*} daily: json array returned by forecast api call
 */

function getForecast(daily) {
  var forecast = [];
  daily.forEach(function (day, i) {
    // skip current forecast
    if (i != 0) {
      forecast.push({
        date: unixToDate(day.dt),
        temp: day.temp.day + "°C",
        id: day.weather[0].id,
        main: day.weather[0].main,
        description: day.weather[0].description,
        iconCode: day.weather[0].icon,
        clouds: day.clouds
      });
    }
  });
  return forecast;
}
/**
 * converts unix timestamp to date DD MMM
 */


function unixToDate(unixTime) {
  var newDate = new Date(unixTime * 1000);
  var fullDate = newDate.toUTCString().split(" "); //Thu, 10 Sep 2020 18:00:00 GMT

  return "".concat(fullDate[0].split(',')[0], " ").concat(fullDate[1], " ").concat(fullDate[2]);
}

module.exports = router;