const express = require('express');
const router = express.Router();

const primateRouter = require('./api/primates');
const sessionRouter = require('./api/sessions');
const eventRouter = require('./api/events');
const mysql = require("mysql");

// const connection = mysql.createConnection({
//     host: process.env.MYSQL,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DB
// });

// TODO: implement readme/documentation to host at this route
router.get('/', function(req, res, next) {
    res.send('api data');
});

router.use('/primates', primateRouter);
router.use('/sessions', sessionRouter);
router.use('/events', eventRouter);

module.exports = router;
