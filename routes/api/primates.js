const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// TODO: Upgrade this to utilize database
var primates = [
    {id: 101, name: 'Caesar', birthYear: 1999, sex: 'male', species: 'Chimpanzee'},
    {id: 102, name: 'Cornelia', birthYear: 2001, sex: 'female', species: 'Chimpanzee'},
    {id: 103, name: 'Maurice', birthYear: 1997, sex: 'male', species: 'Orangutan'},
    {id: 104, name: 'Koba', birthYear: 2000, sex: 'male', species: 'Bonobo'}
];

//Primate sex handled according to ISO/IEC 5218
const sexes = ['Male', 'Female', 'NotKnown', 'NotApplicable'];
function renderSex(sex) {
    switch (sex) {
        case 'Male':
            return 1;
        case 'Female':
            return 2;
        case 'NotApplicable':
            return 9;
        default:
        case 'NotKnown':
            return 0;
    }
}

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
function getAllPrimates(){
    return new Promise((resolve, reject) => {
        // This question mark syntax will be explained below.
        const sql = 'SELECT * FROM primates';
        connection.query(sql, function (err, results, fields) {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
}
router.get('/', function(req, res, next) {
    getAllPrimates()
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
function getPrimateByID(id){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM primates WHERE id = ?';
        console.log(sql);
        connection.query(sql, [id], function (err, results, fields) {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
}
router.get('/:id([0-9])', function(req, res, next) {
    getPrimateByID(req.params.id)
        .then(data => {
            if (data.length > 0) {
                res.json(data);
            } else {
                res.status(404).json({ message: 'Not Found' });
            }
        })
        .catch(err => console.error(err));
});

// POST new thing
function createNewPrimate(primate){
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO primates (name, birthYear, sex, species, zoo)\nVALUES (?, ?, ?, ?, ?)';
        console.log(sql);
        connection.query(sql, [
            primate.name,
            primate.birthYear,
            renderSex(primate.sex),
            primate.species,
            primate.zoo
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
        !req.body.species ||
        !req.body.zoo ||
        !req.body.birthYear.toString().match(/^[0-9]{4}$/g) ||
        !(sexes.includes(req.body.sex)))
    {
        res.status(400);
        res.json({message: 'Bad Request'});
    } else {
        createNewPrimate(req.body)
            .then(data => {
                res.send('Success!');
            })
            .catch(err => {
                console.error(err)
                res.send('Failed to insert new primate');
            });
    }
});

// PUT update
router.put('/:id', function(req, res) {
    if( !req.body.name ||
        !req.body.species ||
        !req.body.zoo ||
        !req.body.birthYear.toString().match(/^[0-9]{4}$/g) ||
        !(sexes.includes(req.body.sex)))
    {
        res.status(400);
        res.json({message: 'Bad Request'});
    } else {
        var updateIndex = primates.map(function (primate) {
            return primate.id;
        }).indexOf(parseInt(req.params.id));

        if (updateIndex === -1) {
            var newId = primates[primates.length - 1].id + 1;
            primates.push({
                id: newId,
                name: req.body.name,
                birthYear: req.body.birthYear,
                sex: req.body.sex,
                species: req.body.species
            })
        } else {
            primates[updateIndex] = {
                id: req.body.id,
                name: req.body.name,
                birthYear: req.body.birthYear,
                sex: req.body.sex,
                species: req.body.species
            };
            res.json({message: 'primate id ' + req.params.id + ' updated', location: '/api/' + req.params.id});
        }
    }
});

// PATCH?!?!?!

// DELETE individual thing
router.delete('/:id', function(req, res){
    var removeIndex = primates.map(function(primate){
        return primate.id;
    }).indexOf(parseInt(req.params.id)); //Gets us the index of movie with given id.

    if(removeIndex === -1){
        res.json({message: 'Not found'});
    } else {
        primates.splice(removeIndex, 1);
        res.send({message: 'primate id ' + req.params.id + ' removed.'});
    }
});

module.exports = router;
