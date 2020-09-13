"use strict";

/**
 * auth route does auth0 authentication for spotify, endpoints:
 * - auth/login
 * - auth/callback
 */
var express = require('express');

var request = require('request');

var router = express.Router();

var querystring = require('querystring'); // spotify api credentials


var CLIENT_ID = 'c32e2b8a2a74444f9448149ddd2d22d8';
var CLIENT_SECRET = 'bc1a9f6e6cb543278f55e30d25ea1b4a';
var REDIRECT_URI = 'http://localhost:3000/auth/callback';
var stateKey = 'spotify_auth_state';
/**
 * redirects to spotify to authorise user
 */

router.get('/login', function (req, res) {
  var state = generateRandomString(16);
  var scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private';
  res.cookie(stateKey, state); // redirect to spotify accounts service

  res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
    state: state
  }));
});
/**
 * redirect back to website after authentication
 */

router.get("/callback", function (req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' + querystring.stringify({
      error: 'state_mismatch'
    }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
      },
      json: true
    };
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
            refresh_token = body.refresh_token,
            user_id = "";
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          json: true
        }; // use the access token to access the Spotify Web API

        request.get(options, function (error, response, body) {
          user_id = body.id;
          res.redirect('http://localhost:3000/' + querystring.stringify({
            access_token: access_token,
            user_id: user_id // refresh_token: refresh_token

          }));
        });
      } else {
        res.redirect('/#' + querystring.stringify({
          error: 'invalid_token'
        }));
      }
    });
  }
});
/****************************** HELPER FUNCTIONS ******************************/

var generateRandomString = function generateRandomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

var encodeFormData = function encodeFormData(data) {
  return Object.keys(data).map(function (key) {
    return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
  }).join('&');
};

module.exports = [router, encodeFormData];