const express = require('express');
const router = express.Router();
const path = require('path');
const date = require('date-and-time');

function update_clock(req, res, next, io) {
    setTimeout(() => {
        const now = new Date();
        let update = date.format(now, 'hh:mm:ss A');
        io.emit('tick', update);
        // console.log("Clock Updated!");
        update_clock(req, res, next, io)
    }, 1000);
}

/* GET time listing. */
router.get('/', function(req, res, next) {
    const io = req.app.get('socketio');
    res.sendFile(path.join(__dirname, '../public/time.html'));

    update_clock(req, res, next, io);
});

module.exports = router;