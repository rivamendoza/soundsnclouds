"use strict";

/**
 * playlist route parses weather information into playlists, endpoints:
 * - playlist/name/playlistDesc/numTracks/market/makePublic/id/main/weatherDesc/temp/city/clouds/user/accessToken
 * - playlist/id/main/desc/temp/city/clouds/user/accessToken
 */
var express = require('express');

var request = require('request');

var router = express.Router(); // seed information

var seed_genres = {
  wet: "chill%2Cambient",
  snow: "holidays",
  clear: "pop%2Chappy",
  overcast: "alternative%2Cacoustic",
  scary: "electronic%2Cedm"
}; // enum of weather types

var type = {
  WET: 'WET',
  SNOW: 'SNOW',
  CLEAR: "CLEAR",
  OVERCAST: "OVERCAST",
  SCARY: "SCARY"
}; // generate custom playlist

router.get('/:name/:playlistDesc/:numTracks/:market/:makePublic/:id/:main/:weatherDesc/:temp/:city/:clouds/:user/:accessToken', function (req, res) {
  var _req$params = req.params,
      name = _req$params.name,
      playlistDesc = _req$params.playlistDesc,
      numTracks = _req$params.numTracks,
      market = _req$params.market,
      makePublic = _req$params.makePublic,
      id = _req$params.id,
      main = _req$params.main,
      weatherDesc = _req$params.weatherDesc,
      temp = _req$params.temp,
      city = _req$params.city,
      clouds = _req$params.clouds,
      user = _req$params.user,
      accessToken = _req$params.accessToken; // assign playlist properties, use default if unchanged or blank

  var playlist = {
    name: name != "default" && name != "" ? name : "".concat(main.toLowerCase(), " in ").concat(city.toLowerCase()),
    description: playlistDesc != "default" && playlistDesc != "" ? playlistDesc : "currently a ".concat(temp, "\xB0C with ").concat(weatherDesc, " kinda mood"),
    limit: numTracks != undefined && numTracks != "default" ? numTracks : "10",
    market: numTracks != undefined && market != "default" ? market : undefined,
    makePublic: makePublic
  }; // get track parameters

  var track = generateTrackParameters(id, clouds, temp);
  var getTracksUrl = "https://api.spotify.com/v1/recommendations?" + "limit=".concat(playlist.limit) + "&seed_genres=".concat(track.seed_genre) + "&target_acousticness=".concat(track.acousticness) + "&target_danceability=".concat(track.danceability) + "&target_energy=".concat(track.energy) + "&target_valence=".concat(track.valence); // add market endpoint if user specified

  if (playlist.market) {
    getTracksUrl += "&market=".concat(playlist.market);
  }

  var getTracks = {
    url: getTracksUrl,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      'Authorization': 'Bearer ' + accessToken
    },
    json: true
  }; // get recommended tracks

  request.get(getTracks, function (trackError, trackResponse, trackBody) {
    var createPlaylist = {
      url: "https://api.spotify.com/v1/users/".concat(user, "/playlists"),
      body: {
        "name": playlist.name,
        "description": playlist.description,
        "public": playlist.makePublic
      },
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + accessToken
      },
      json: true
    }; // create playlist

    if (!trackError && trackResponse.statusCode == 200) {
      console.log("Success: reccomended tracks received");
      var tracks = getTrackUris(trackBody, playlist.limit);
      request.post(createPlaylist, function (createError, createResponse, createBody) {
        var playlistId = createBody.id;
        var addTracksUrl = "https://api.spotify.com/v1/playlists/".concat(playlistId, "/tracks?uris=") + tracks;
        var addTracks = {
          url: addTracksUrl,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + accessToken
          },
          json: true
        }; // add tracks to playlist

        if (!createError && createResponse.statusCode == 201) {
          console.log("Success: playlist created with id ".concat(playlistId));
          request.post(addTracks, function (addError, addResponse, addBody) {
            if (!addError && addResponse.statusCode == 201) {
              console.log("Success: recommended tracks added to new playlist");
              res.send(playlistId); //return new playlist id
            } else {
              res.send("Error ".concat(addResponse.statusCode, ": could not add tracks to new playlist"));
            }
          });
        } else {
          res.send("Account Error ".concat(createResponse.statusCode, ": Could not create playlist. Access token and/or user id is invalid. Please log in again."));
        }
      });
    } else if (trackResponse.statusCode == 401) {
      res.send("Account Error ".concat(trackResponse.statusCode, ": Access token is invalid or has expired. Please log in again."));
    } else {
      res.send("Error ".concat(trackResponse.statusCode, ": Country (").concat(playlist.market, ") likely doesn't have an existing market on Spotify. Please try again without using that market."));
    }
  });
}); // generate default playlist

router.get('/:id/:main/:desc/:temp/:city/:clouds/:user/:accessToken', function (req, res) {
  var _req$params2 = req.params,
      id = _req$params2.id,
      main = _req$params2.main,
      desc = _req$params2.desc,
      temp = _req$params2.temp,
      city = _req$params2.city,
      clouds = _req$params2.clouds,
      user = _req$params2.user,
      accessToken = _req$params2.accessToken;
  var track = generateTrackParameters(id, clouds, temp);
  var getTracksUrl = "https://api.spotify.com/v1/recommendations?" + "limit=10" + "&seed_genres=".concat(track.seed_genre) + "&target_acousticness=".concat(track.acousticness) + "&target_danceability=".concat(track.danceability) + "&target_energy=".concat(track.energy) + "&target_valence=".concat(track.valence);
  var getTracks = {
    url: getTracksUrl,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      'Authorization': 'Bearer ' + accessToken
    },
    json: true
  }; // get recommended tracks

  request.get(getTracks, function (trackError, trackResponse, trackBody) {
    var createPlaylist = {
      url: "https://api.spotify.com/v1/users/".concat(user, "/playlists"),
      body: {
        "name": "".concat(main.toLowerCase(), " in ").concat(city.toLowerCase()),
        "description": "a ".concat(temp, "\xB0C with ").concat(desc, " kinda mood"),
        "public": false
      },
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + accessToken
      },
      json: true
    }; // create playlist

    if (!trackError && trackResponse.statusCode == 200) {
      console.log("Success: reccomended tracks received");
      var tracks = getTrackUris(trackBody, 10);
      request.post(createPlaylist, function (createError, createResponse, createBody) {
        var playlistId = createBody.id;
        var addTracksUrl = "https://api.spotify.com/v1/playlists/".concat(playlistId, "/tracks?uris=") + tracks;
        var addTracks = {
          url: addTracksUrl,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + accessToken
          },
          json: true
        }; // add tracks to playlist

        if (!createError && createResponse.statusCode == 201) {
          console.log("Success: playlist created with id ".concat(playlistId));
          request.post(addTracks, function (addError, addResponse, addBody) {
            console.log("Success: recommended tracks added to new playlist");

            if (!addError && addResponse.statusCode == 201) {
              res.send(playlistId); //return new playlist id
            } else {
              res.send("Error ".concat(addResponse.statusCode, ": could not add tracks to new playlist"));
            }
          });
        } else {
          res.send("Account Error ".concat(createResponse.statusCode, ": Could not create playlist. Access token and/or user id is invalid. Please log in again."));
        }
      });
    } else if (trackResponse.statusCode == 401) {
      res.send("Account Error ".concat(trackResponse.statusCode, ": Access token is invalid or has expired. Please log in again."));
    } else {
      res.send("Error getting recommended tracks");
    }
  });
});
/****************************** PLAYLIST GENERATOR METHODS ******************************/

/**
 * determine track parameters given weather id, cloud percentage and temperature
 */

function generateTrackParameters(id, clouds, temp) {
  // initialise parameters
  var parameters = {
    seed_genre: seed_genres.clear,
    acousticness: -1,
    energy: -1,
    valence: -1,
    danceability: -1
  };
  var weather = type.CLEAR;
  var tempWeight = temp > 0 ? temp / 100 : 0;
  var cloudWeight = clouds / 100;
  var weatherGroup = Math.floor(id / 100 % 10); // SET SEED GENRE
  // clear skies

  if (id == 800) {
    weather = type.CLEAR;
    parameters.seed_genre = seed_genres.clear;
  } // snow
  else if (weatherGroup == 6) {
      weather = type.SNOW;
      parameters.seed_genre = seed_genres.snow;
    } // drizzle or rain
    else if (weatherGroup == 3 || weatherGroup == 5) {
        weather = type.WET;
        parameters.seed_genre = seed_genres.wet;
      } // thunderstorm
      else if (weatherGroup == 2) {
          weather = type.SCARY;
          parameters.seed_genre = seed_genres.scary;
        } // clouds
        else if (weatherGroup == 8) {
            weather = type.OVERCAST;
            parameters.seed_genre = seed_genres.overcast;
          } // atmosphere
          else if (weatherGroup == 7) {
              // 701 mist, 721 haze, 741 fog => overcast
              if (id == 701 || id == 721 || id == 741) {
                weather = type.OVERCAST;
                parameters.seed_genre = seed_genres.overcast;
              } // 711 smoke, 731 dust, 751 sand, 762 ash, 771 squall, 781 tornado => scary
              else {
                  weather = type.SCARY;
                  parameters.seed_genre = seed_genres.scary;
                }
            } // SET ACOUSTICNESS => cloudier = more acoustic


  parameters.acousticness = cloudWeight; // SET ENERGY => clear/scary = more energetic

  if (weather == type.SCARY) {
    parameters.energy = 1;
  } else if (weather == type.CLEAR) {
    parameters.energy = 0.8;
  } else if (weather == type.OVERCAST) {
    parameters.energy = 0.2;
  } else {
    parameters.energy = 0.5;
  } // SET VALENCE => clear/snow = positive(1), wet/overcast = neutral, scary = negative (0)


  if (weather == type.CLEAR || weather == type.SNOW) {
    parameters.valence = 1;
  } else if (weather == type.WET || weather == type.OVERCAST) {
    parameters.valence = 0.5 * (2 - cloudWeight); // the cloudier the less positive
  } else {
    parameters.valence = 0;
  } // SET DANCEABILITY => hotter = dancier


  if (temp > 25) {
    parameters.danceability = 1;
  } else if (temp < 10) {
    parameters.danceability = 0;
  } else {
    parameters.danceability = 0.5 + tempWeight;
  }

  return parameters;
}
/**
 * retrieves track uris from results returned from recommended tracks api call
 * @param {*} results 
 * @param {*} count 
 */


function getTrackUris(results, count) {
  var allTracks = results.tracks[0].uri;
  var regex = /:/gi;

  for (var i = 1; i < count; i++) {
    var track = results.tracks[i].uri;
    track = track.replace(regex, '%3A');
    allTracks = "".concat(allTracks, "%2C").concat(track);
  }

  return allTracks;
}

module.exports = router;