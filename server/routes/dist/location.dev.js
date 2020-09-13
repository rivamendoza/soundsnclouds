"use strict";

/**
 * location route retrieves extra location information also using openweathermaps api, endpoint:
 * - location/lat/long
 */
var express = require('express');

var request = require('request');

var router = express.Router(); // openweathermaps api credentials

var CLIENT_ID = '61005c04e2164479f6b4fa8e51cb8535';
/**
 * get city and country name of location given its coordinates
 */

router.get('/:lat/:long', function (req, res) {
  var _req$params = req.params,
      _long = _req$params["long"],
      lat = _req$params.lat;
  var url = "http://api.openweathermap.org/data/2.5/weather?lat=".concat(lat, "&lon=").concat(_long, "&units=metric&appid=").concat(CLIENT_ID);
  request(url, function (err, response, body) {
    var result = JSON.parse(body); // geolocation is valid

    if (result.cod == 200 || result.cod == 304) {
      var location = {
        city: result.name,
        country: result.sys.country
      };
      res.send(location);
    } else {
      res.send({
        error: "invalid coordinates"
      });
    }
  });
});
module.exports = router;