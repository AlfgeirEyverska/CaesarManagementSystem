const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Prepare to connect to MySQL with your secret environment variables
const connection = mysql.createConnection({
    host: process.env.MYSQL,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});

// Make the connection
connection.connect(function (err) {
    // Check if there is a connection error
    if (err) {
        console.log('connection error', err.stack);
        return;
    }
    // If there was no error, print this message
    console.log(`connected to database`);
});

// TODO: Implement user authentication/access tokens
// GET everything
function getAllTWEvents(){
    return new Promise((resolve, reject) => {
        // This question mark syntax will be explained below.
        const sql = 'select * from tw_events';
        connection.query(sql, function (err, results, fields) {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
}

router.get('/tw', function(req, res, next) {
    getAllTWEvents()
        .then(data => {
            if (data.length > 0) {
                res.json(data);
            } else {
                res.status(404).json({ message: 'Not Found' });
            }
        })
        .catch(err => console.error(err));
});

// GET individual thing
function getTWEventsByName(name){
    return new Promise((resolve, reject) => {
        const sql = 'select t.hit, t.radius, t.position, t.time, t.hitMarker, sessions.id as session\n' +
                    'from tw_events as t\n' +
                    'inner join sessions on t.session = sessions.id\n' +
                    'inner join primates on sessions.primate = primates.id\n' +
                    'where primates.name = ?';
        console.log(sql);
        connection.query(sql, [name], function (err, results, fields) {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
}
router.get('/tw/:name', function(req, res, next) {
    getTWEventsByName(req.params.name)
        .then(data => {
            if (data.length > 0) {
                res.json(data);
            } else {
                res.status(404).json({ message: 'Not Found' });
            }
        })
        .catch(err => console.error(err));
});

// GET tw events by session ID
function getTWEventsBySessionID(id){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM tw_events WHERE session = ?';
        console.log(sql);
        connection.query(sql, [id], function (err, results, fields) {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
}
router.get('/session/:id', function(req, res, next) {
    getTWEventsBySessionID(req.params.id)
        .then(data => {
            if (data.length > 0) {
                res.json(data);
            } else {
                res.status(404).json({ message: 'Not Found' });
            }
        })
        .catch(err => console.error(err));
});

// POST new training wheels event
function postTWEvent(event, session_id){
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO tw_events ' +
                    '(hit, radius, position, time, hitMarker, session) ' +
                    'VALUES ( if(?,1,0), ?, ?, ?, ?, ?)';
        console.log(sql);
        connection.query(sql, [
            event.hit,
            event.radius,
            event.position,
            event.time,
            event.hitMarker,
            session_id.id
        ], function (err, results, fields) {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
}

router.post('/:id', function(req, res){
    console.log(req.params);
    console.log(req.body);

    //Check if all fields are provided and are valid:
    if( !(['0','1'].includes(req.body.hit)) ||
        !req.body.radius ||
        !req.body.position ||
        !req.body.time ||
        !req.body.hitMarker)
    {
        res.status(400);
        res.json({message: 'Bad Request'});
    } else {
        postTWEvent(req.body, req.params)
            .then(data => {
                res.send('Success!');
            })
            .catch(err => {
                console.error(err)
                res.send('Failed to insert new Event');
            });
    }
});

module.exports = router;
