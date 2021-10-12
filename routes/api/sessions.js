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
function getAllSessions(){
    return new Promise((resolve, reject) => {
        // This question mark syntax will be explained below.
        const sql = 'select sessions.id as session, primates.name as name, apps.name as app, sessions.date, zoos.name as zoo\n' +
                    'from sessions\n' +
                    'inner join primates on sessions.primate = primates.id\n' +
                    'inner join apps on sessions.app = apps.id\n' +
                    'inner join zoos on primates.zoo = zoos.id';
        connection.query(sql, function (err, results, fields) {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
}

router.get('/', function(req, res, next) {
    getAllSessions()
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
function getSessionsByName(name){
    return new Promise((resolve, reject) => {
        const sql = 'select sessions.id as session, primates.name as name, apps.name as app, sessions.date, zoos.name as zoo\n' +
                    'from sessions\n' +
                    'inner join primates on sessions.primate = primates.id\n' +
                    'inner join apps on sessions.app = apps.id\n' +
                    'inner join zoos on primates.zoo = zoos.id\n' +
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
router.get('/:name', function(req, res, next) {
    getSessionsByName(req.params.name)
        .then(data => {
            if (data.length > 0) {
                res.json(data);
            } else {
                res.status(404).json({ message: 'Not Found' });
            }
        })
        .catch(err => console.error(err));
});

// POST new session
function createSession(session){
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO sessions \n' +
                    '(primate, date, app) \n' +
                    'VALUES ((SELECT id FROM primates WHERE name = ?), ?, ' +
                    '(SELECT id FROM apps WHERE name = ?)) \n' +
                    'returning id';
        console.log(sql);
        connection.query(sql, [
            session.name,
            session.date,
            session.app
        ], function (err, results, fields) {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
}

router.post('/', function(req, res){
    //Check if all fields are provided and are valid:
    if( !req.body.name ||
        !req.body.date ||
        !req.body.app)
    {
        res.status(400);
        res.json({message: 'Bad Request'});
    } else {
        createSession(req.body)
            .then(data => {
                console.log(data);
                res.json(data);
                // res.send('Success!');
            })
            .catch(err => {
                console.error(err)
                res.send('Failed to insert new session');
            });
    }
});

module.exports = router;
