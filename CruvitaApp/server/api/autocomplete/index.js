'use strict';

var express = require('express');
var controller = require('./autocomplete.controller');

var router = express.Router();

router.get('/', controller.show);

module.exports = router;