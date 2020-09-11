const express = require('express');
const request = require('request');
const { param } = require('./weather');
const router = express.Router();

// seed information
const seed_genres = {
  wet: "chill%2Cambient",
  snow: "holidays",
  clear: "pop%2Chappy",
  overcast: "alternative%2Cacoustic",
  scary: "electronic%2Cedm"
}

const type =  {
  WET: 'WET',
  SNOW: 'SNOW',
  CLEAR: "CLEAR",
  OVERCAST: "OVERCAST",
  SCARY: "SCARY"
}


// generate custom playlist
router.get('/:name/:playlistDesc/:numTracks/:market/:makePublic/:id/:main/:weatherDesc/:temp/:city/:clouds/:user/:accessToken', function (req, res) {
  let {name, playlistDesc, numTracks, market, makePublic, id, main, weatherDesc, temp, city, clouds, user, accessToken} = req.params;

  console.log(req.params);
  // assign playlist properties, use default if unchanged or blank
  let playlist = {
    name: (name != "default" && name != "") ? name :`${main.toLowerCase()} in ${city.toLowerCase()}`,
    description: (playlistDesc != "default" && playlistDesc != "") ? playlistDesc : `currently a ${temp}°C with ${weatherDesc} kinda mood`,
    limit: (numTracks != undefined && numTracks != "default") ? numTracks : "10",
    market: (numTracks != undefined && market != "default") ? market : undefined,
    makePublic: makePublic  
  }

  // get track parameters
  let track = generateTrackParameters(id, clouds, temp);
  
  let getTracksUrl = "https://api.spotify.com/v1/recommendations?"  + 
              `limit=${playlist.limit}` + 
              `&seed_genres=${track.seed_genre}` +
              `&target_acousticness=${track.acousticness}` +
              `&target_danceability=${track.danceability}` +
              `&target_energy=${track.energy}` +
              `&target_valence=${track.valence}`;
  
  // add market endpoint if user specified
  if(playlist.market) {
    getTracksUrl += `&market=${playlist.market}`
  }

  console.log(getTracksUrl);

  let getTracks = {
    url: getTracksUrl,
    headers: {
      "Accept" : "application/json",
      "Content-Type" : "application/json",
      'Authorization': 'Bearer ' + accessToken
    },
    json: true
  };

  // get recommended tracks
  request.get(getTracks, function(trackError, trackResponse, trackBody) {
    let createPlaylist = {
      url: `https://api.spotify.com/v1/users/${user}/playlists`,
      body: {
        "name": playlist.name,
        "description": playlist.description,
        "public": playlist.makePublic      
      },
      headers: {
        "Accept" : "application/json",
        "Content-Type" : "application/json",
        'Authorization': 'Bearer ' + accessToken
      },
      json: true
    };

    // create playlist
    if(!trackError && trackResponse.statusCode == 200) {
      console.log(`reccomended tracks received`);

      let tracks = getTrackUris(trackBody, playlist.limit);

      request.post(createPlaylist, function(createError, createResponse, createBody) {
        let playlistId = createBody.id;
        let addTracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=` + tracks;

        let addTracks = {
          url: addTracksUrl,
          headers: {
            "Accept" : "application/json",
            "Content-Type" : "application/json",
            'Authorization': 'Bearer ' + accessToken
          },
          json: true
        }

        // add tracks to playlist
        if(!createError && createResponse.statusCode == 201) {
          console.log(`playlist created id: ${playlistId}`);

          request.post(addTracks, function(addError, addResponse, addBody){
            console.log(`recommended tracks added to new playlist`);

            if(!addError && addResponse.statusCode == 201) {
              res.send(playlistId)  //return new playlist id
            }
            else {
              res.send("Error adding tracks to new playlist");
            }
          });
        }
        else {
          res.send("Error creating playlist");
        }
        
      });
    }
    else{
      res.send(`Error: Country (${playlist.market}) doesn't have an existing market on Spotify. Please try again without using that market.`);
    }
  });
})

// generate default playlist
router.get('/:id/:main/:desc/:temp/:city/:clouds/:user/:accessToken', function (req, res) {
  const { id, main, desc, temp, city, clouds, user, accessToken } = req.params;

  let track = generateTrackParameters(id, clouds, temp);
  console.log(req.params)

  let getTracksUrl = "https://api.spotify.com/v1/recommendations?"  + 
              `limit=10` + 
              `&seed_genres=${track.seed_genre}` +
              `&target_acousticness=${track.acousticness}` +
              `&target_danceability=${track.danceability}` +
              `&target_energy=${track.energy}` +
              `&target_valence=${track.valence}`;

  let getTracks = {
    url: getTracksUrl,
    headers: {
      "Accept" : "application/json",
      "Content-Type" : "application/json",
      'Authorization': 'Bearer ' + accessToken
    },
    json: true
  };

  // get recommended tracks
  request.get(getTracks, function(trackError, trackResponse, trackBody) {
    let createPlaylist = {
      url: `https://api.spotify.com/v1/users/${user}/playlists`,
      body: {
        "name": `${main.toLowerCase()} in ${city.toLowerCase()}`,
        "description": `currently a ${temp}°C with ${desc} kinda mood`,
        "public": false      
      },
      headers: {
        "Accept" : "application/json",
        "Content-Type" : "application/json",
        'Authorization': 'Bearer ' + accessToken
      },
      json: true
    };

    // create playlist
    if(!trackError && trackResponse.statusCode == 200) {
      let tracks = getTrackUris(trackBody, 10);

      request.post(createPlaylist, function(createError, createResponse, createBody) {
        let playlistId = createBody.id;
        let addTracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=` + tracks;

        let addTracks = {
          url: addTracksUrl,
          headers: {
            "Accept" : "application/json",
            "Content-Type" : "application/json",
            'Authorization': 'Bearer ' + accessToken
          },
          json: true
        }

        // add tracks to playlist
        if(!createError && createResponse.statusCode == 201) {
          request.post(addTracks, function(addError, addResponse, addBody){
            if(!addError && addResponse.statusCode == 201) {
              res.send(playlistId)  //return new playlist id
            }
            else {
              res.send("Error adding tracks to new playlist");
            }
          });
        }
        else {
          res.send("Error creating playlist");
        }
        
      });
    }
    else{
      res.send("Error getting recommended tracks")
    }
  });
})

// determine track parameters given weather id, cloud percentage and temperature
function generateTrackParameters(id, clouds, temp) {
  let parameters = {
    seed_genre: seed_genres.clear,
    acousticness: -1,
    energy: -1,
    valence: -1,
    danceability: -1
  }
  let weather = type.CLEAR;
  let tempWeight = (temp > 0) ? temp/100 : 0;
  let cloudWeight = clouds/100;
  let weatherGroup = Math.floor(id/100 % 10);
  // console.log("id: ", id);
  // console.log("weather group: ", weatherGroup);
  // console.log("clouds: ", clouds);
  // console.log("cloudiness: ", cloudWeight);
  // console.log("temp: ", temp);
  // console.log("tempWeight: ", tempWeight);

  // SET SEED GENRE
  // clear skies
  if(id == 800) {
    weather = type.CLEAR;
    parameters.seed_genre = seed_genres.clear;
  }
  // snow
  else if (weatherGroup == 6) {
    weather = type.SNOW;
    parameters.seed_genre = seed_genres.snow;
  }
  // drizzle or rain
  else if (weatherGroup == 3 || weatherGroup == 5) {
    weather = type.WET;
    parameters.seed_genre = seed_genres.wet;
  }
  // thunderstorm
  else if(weatherGroup == 2) {
    weather = type.SCARY;
    parameters.seed_genre = seed_genres.scary;
  }
  // clouds
  else if(weatherGroup == 8) {
    weather = type.OVERCAST;
    parameters.seed_genre = seed_genres.overcast;
  }
  // atmosphere
  else if(weatherGroup == 7) {
    // 701 mist, 721 haze, 741 fog => overcast
    if(id == 701 || id == 721 ||id == 741) {
      weather = type.OVERCAST;
      parameters.seed_genre = seed_genres.overcast;
    }
    // 711 smoke, 731 dust, 751 sand, 762 ash, 771 squall, 781 tornado => scary
    else {
      weather = type.SCARY;
      parameters.seed_genre = seed_genres.scary;
    }
  }

  // console.log("weather type: ", weather);

  // SET ACOUSTICNESS => cloudier = more acoustic
  parameters.acousticness = cloudWeight;  

  // SET ENERGY => clear/scary = more energetic
  if(weather == type.SCARY) {
    parameters.energy = 1
  } 
  else if(weather == type.CLEAR) {
    parameters.energy = 0.8
  } 
  else if(weather == type.OVERCAST) {
    parameters.energy = 0.2
  }
  else{
    parameters.energy = 0.5
  }

  // SET VALENCE => clear/snow = positive(1), wet/overcast = neutral, scary = negative (0)
  if(weather == type.CLEAR || weather == type.SNOW) {
    parameters.valence = 1;
  }
  else if(weather == type.WET || weather == type.OVERCAST) {
    parameters.valence = 0.5 * (2-cloudWeight)// the cloudier the less positive
  }
  else {
    parameters.valence = 0;
  }
  
  // SET DANCEABILITY => hotter = dancier
  if(temp > 25) {
    parameters.danceability = 1;
  }
  else if (temp < 10) {
    parameters.danceability = 0;
  }
  else {
    parameters.danceability = 0.5 + tempWeight;
  }
  
  // console.log("parameters", parameters);
  return parameters;
}

function getTrackUris(results, count){
  let allTracks = results.tracks[0].uri;
  let regex = /:/gi;

  for(let i = 1; i < count; i++) {
    let track = results.tracks[i].uri;
    track = track.replace(regex, '%3A');

    allTracks = `${allTracks}%2C${track}`;
  }

  // console.log(allTracks);

  return allTracks;
}

module.exports = router;