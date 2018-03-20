'use strict';

var express = require('express');
var controller = require('./homes.controller');

var router = express.Router();

router.get('/schools', controller.schools);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/blankHome', controller.blankHome);

module.exports = router;