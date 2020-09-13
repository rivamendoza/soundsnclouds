"use strict";

var createError = require('http-errors');

var express = require('express');

var path = require('path');

var cookieParser = require('cookie-parser');

var logger = require('morgan');

var cors = require("cors");

var port = 3000;

var indexRouter = require('./routes/index');

var locationRouter = require('./routes/location');

var weatherRouter = require('./routes/weather');

var loginRouter = require('./routes/auth');

var playlistRouter = require('./routes/playlist');

var app = express(); // view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser()); // app.use(express.static(path.join(__dirname, 'public')));

app.use(express["static"]('../client/build')); // hook routers

app.use('/', indexRouter);
app.use('/location', locationRouter);
app.use('/weather', weatherRouter);
app.use('/auth', loginRouter);
app.use('/create', playlistRouter); // routes that don't match api routers will redirect to client

app.use(function (req, res) {
  console.log("current directory: ", __dirname);
  console.log("redirecting to: ", path.join('../client/build', 'index.html'));
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
app.listen(port, function () {
  console.log("soundsnclouds app listening at http://localhost:".concat(port));
});
module.exports = app;