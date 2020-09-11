
const express = require('express');
const request = require('request');
const router = express.Router();

// openweathermaps api credentials
const CLIENT_ID = '61005c04e2164479f6b4fa8e51cb8535';


// get coordinates from city name
router.get('/:city', function (req, res) {
    const { city } = req.params;
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${CLIENT_ID}`
  
    request(url, function (err, response, body) {
      if(err){
        res.send("error");
      } else {
        let weather = JSON.parse(body);
        // console.log(weather.message)
        if(weather.message == "city not found") {
          // console.log("sending error")
          res.send("error")
        } else {
          let coords = weather.coord.lat +  "," + weather.coord.lon
          res.send(coords);    
        }

      }
    });
})

// get city and country of coordinates
router.get('/:lat/:long', function (req, res) {
    const { long, lat } = req.params;
  
    let url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${CLIENT_ID}`;
    request(url, function (err, response, body) {
      if(err){
        res.send("error");
      } else {
        let result = JSON.parse(body);
        // console.log(result.name);
        // console.log(result.sys.country);

        let location = {
          city: result.name,
          country: result.sys.country
        }
        
        res.send(location);
      }
    });
})

module.exports = router;
  