const express = require('express');
const router = express.Router();

const primateRouter = require('./api/primates');
router.use('/primates', primateRouter);

const trainingWheelsRouter = router('./api/trainingWheels');
router.use('/trainingWheels', trainingWheelsRouter);

// TODO: implement readme/documentation to host at this route
router.get('/', function(req, res, next) {
    res.send('api data');
});



module.exports = router;
