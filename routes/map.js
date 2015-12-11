var express = require('express');
var router = express.Router();

/* GET uploadgeometry listing. */
router.get('/', function(req, res, next) {
  res.render('map', { title: 'Map' });
});

module.exports = router;
