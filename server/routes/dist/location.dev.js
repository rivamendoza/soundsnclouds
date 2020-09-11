"use strict";

var express = require('express');

var request = require('request');

var router = express.Router(); // openweathermaps api credentials

var CLIENT_ID = '61005c04e2164479f6b4fa8e51cb8535'; // get coordinates from city name

router.get('/:city', function (req, res) {
  var city = req.params.city;
  var url = "http://api.openweathermap.org/data/2.5/weather?q=".concat(city, "&units=metric&appid=").concat(CLIENT_ID);
  request(url, function (err, response, body) {
    if (err) {
      res.send("error");
    } else {
      var weather = JSON.parse(body); // console.log(weather.message)

      if (weather.message == "city not found") {
        // console.log("sending error")
        res.send("error");
      } else {
        var coords = weather.coord.lat + "," + weather.coord.lon;
        res.send(coords);
      }
    }
  });
}); // get city and country of coordinates

router.get('/:lat/:long', function (req, res) {
  var _req$params = req.params,
      _long = _req$params["long"],
      lat = _req$params.lat;
  var url = "http://api.openweathermap.org/data/2.5/weather?lat=".concat(lat, "&lon=").concat(_long, "&units=metric&appid=").concat(CLIENT_ID);
  request(url, function (err, response, body) {
    if (err) {
      res.send("error");
    } else {
      var result = JSON.parse(body); // console.log(result.name);
      // console.log(result.sys.country);

      var location = {
        city: result.name,
        country: result.sys.country
      };
      res.send(location);
    }
  });
});
module.exports = router;