const express = require('express');
const router = express.Router();
const mysql = require('mysql');

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
function getPrimateByName(name){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM primates WHERE name = ?';
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
    getPrimateByName(req.params.name)
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
router.put('/:name', function(req, res) {
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
        console.log('deleting')
        deletePrimateByName(req.params.name)
            .then(data => {
                console.log('Delete was successful!');
            })
            .catch(err => {
                console.error(err)
                console.log('Failed to delete primate')
            });
        console.log('replacing')
        createNewPrimate(req.body)
            .then(data => {
                console.log('Create was successful!');
            })
            .catch(err => {
                console.error(err)
                console.log('Failed to insert new primate');
            });
        res.json({message: 'primate: name ' + req.params + ' updated', location: '/api/' + req.params.name});
    }
});

// PATCH?!?!?! TODO: fix according to json patch method
// https://medium.com/easyread/http-patch-method-ive-thought-the-wrong-way-c62ad281cb8
function parseJsonPatch(jsonPatch){
    let str = '';
    jsonPatch.forEach((jsn) => {
        switch (jsn.op) {
            case 'replace':
                str += `${jsn.path}="${jsn.value}", `;
            default:
                break;
        }
    })
    console.log(str);
    return str.substring(0, str.length-2);
}

function patchPrimate(name, body){
    return new Promise((resolve, reject) => {
        let updates = parseJsonPatch(body);

        // TODO: look into sql injection concerns
        const sql = `UPDATE primates SET ${updates} WHERE name = ?`;

        console.log(sql);
        console.log('updates', updates);
        console.log('name', name);
        connection.query(sql, [name], function (err, results, fields) {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
}

router.patch('/:name', function(req, res) {

    const data = JSON.parse(req.body.patchList);
    const supportedOps = ['replace'];

    //Check if all fields are provided and are valid:
    if( !supportedOps.includes(data[0].op)) {
        res.status(400);
        res.send('Bad request' + !supportedOps.includes(data[0].op) ? `\nOnly ${supportedOps} supported` : '');
    } else {
        patchPrimate(req.params.name, data)
            .then(data => {
                console.log('Create was successful!', data);
                res.json({message: 'primate name: ' + req.params.name + ' updated', location: '/api/' + req.params.name});
            })
            .catch(err => {
                console.error(err)
                res.send('Failed to patch primate');
            });


    }
});

// DELETE individual thing
function deletePrimateByName(name){
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM primates WHERE name = ?';
        console.log(sql);
        connection.query(sql, [name], function (err, results, fields) {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
}
router.delete('/:name', function(req, res){
    deletePrimateByName(req.params.name)
        .then(data => {
            res.send('Success!');
        })
        .catch(err => {
            console.error(err);
            res.send('Failed to delete primate');
        });
});

module.exports = router;
