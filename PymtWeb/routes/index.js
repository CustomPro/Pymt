var express = require('express');
var router = express.Router();

var adminApi = require('./adminApi');
router.use(adminApi);

module.exports = router;
