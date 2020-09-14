var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let host = req.get('host').split(":")[0];
  res.render('index', { title: 'soundsnclouds server running on http://' + host + ":9000"});
});

module.exports = router;
