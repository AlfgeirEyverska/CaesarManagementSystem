const express = require('express');
const router = express.Router();

const primateRouter = require('./api/primates');

// TODO: implement readme/documentation to host at this route
router.get('/', function(req, res, next) {
    res.send('api data');
});

router.use('/primates', primateRouter);

module.exports = router;
