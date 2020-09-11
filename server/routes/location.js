
/**
 * location route retrieves extra location information also using openweathermaps api, endpoint:
 * - location/lat/long
 */
const express = require('express');
const request = require('request');
const router = express.Router();

// openweathermaps api credentials
const CLIENT_ID = '61005c04e2164479f6b4fa8e51cb8535';

/**
 * get city and country name of location given its coordinates
 */
router.get('/:lat/:long', function (req, res) {
    const { long, lat } = req.params;
  
    let url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${CLIENT_ID}`;

    request(url, function (err, response, body) {
      if(err){
        res.send("Error getting city and country name from location");
      } 
      else {
        let result = JSON.parse(body);

        let location = {
          city: result.name,
          country: result.sys.country
        }
        
        res.send(location);
      }
    });
})

module.exports = router;
  