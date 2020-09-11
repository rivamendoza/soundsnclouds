"use strict";

var express = require('express');

var request = require('request');

var router = express.Router(); // openweathermaps api credentials

var CLIENT_ID = '61005c04e2164479f6b4fa8e51cb8535'; // get weather by city

router.get('/:city', function (req, res) {
  var city = req.params.city;
  var url = "http://api.openweathermap.org/data/2.5/weather?q=".concat(city, "&units=metric&appid=").concat(CLIENT_ID);
  request(url, function (err, response, body) {
    if (err) {
      res.send("error");
    } else {
      var result = JSON.parse(body);

      if (result.cod !== 200) {
        res.send("Invalid city");
      } else {
        var output = {
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
      }
    }
  });
}); // get weather by coordinates

router.get('/:lat/:long', function (req, res) {
  var _req$params = req.params,
      _long = _req$params["long"],
      lat = _req$params.lat;
  var url = "http://api.openweathermap.org/data/2.5/weather?lat=".concat(lat, "&lon=").concat(_long, "&units=metric&appid=").concat(CLIENT_ID);
  request(url, function (err, response, body) {
    if (err) {
      res.send("error");
    } else {
      var result = JSON.parse(body);

      if (result.cod !== 200) {
        res.send("Invalid city");
      } else {
        var output = {
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
      }
    }
  });
}); // get weather history of city

router.get('/history/:city', function (req, res) {
  var _brisbane = "brisbane",
      city = _brisbane.city;
  var url = "http://api.openweathermap.org/data/2.5/weather?q=".concat(city, "&units=metric&appid=").concat(CLIENT_ID); // let url = `http://history.openweathermap.org/data/2.5/history/city?q=${city}&type=day&start=${start}&cnt=7&appid=${CLIENT_ID}`;

  request(url, function (err, response, body) {
    if (err) {
      res.send("error");
    } else {
      var result = JSON.parse(body);
      res.send(result);
    }
  });
}); // get weather forecast of coordinates

router.get('/forecast/:lat/:long', function (req, res) {
  var _req$params2 = req.params,
      lat = _req$params2.lat,
      _long2 = _req$params2["long"];
  var url = "https://api.openweathermap.org/data/2.5/onecall?lat=".concat(lat, "&lon=").concat(_long2, "&%20exclude=hourly,daily&appid=").concat(CLIENT_ID);
});
module.exports = router;