/*  
    index.js, where the back-end is defined.

   1. First the modules it needs in its web services,
   2. Then the web services defined: URL pattern => handler function, 
   3. And at the end, starting the server and 
      making it to listen to port 80

   To start the web server for real, we need to run this
   command on server command line, in the folder of this file:
   > nodemon --ignore '*.json' <--------------------------------------------------
   OR > node index.js
 */

// > sudo npm install --save express          or -g mean-cli instead of --save express  + mean init yourNewApp
// (In your node server project folder, where you run "sudo node server.js" or same plus "sudo node server.js&")
var express = require('express');
var app = express();

// > sudo npm install --save fs    // Or was the npm install command needed for this package nowadays? 
// var fs = require("fs");

// > sudo npm install --save body-parser    // Or was the npm install command needed for this package nowadays? 
var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

// > sudo npm install --save jsonfile       // This command was needed 
var jsonfile = require('jsonfile');

const FILEPATH = __dirname + "/" + "categories.json";

app.use(function (req, res, next) {
    "use strict";
    // We need the following as you'll run HTML+JS+Ajax+jQuery on http://localhost, 
    // but service is taken from http://protoNNN.haaga-helia.fi (NNN is some number)
    // https://www.w3.org/TR/cors/#access-control-allow-origin-response-header
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Above commands for setting up the required modules, settings and headers!!!
// At the bottom of this file is the server starting function!!!

// Now follow the action functions that register to handle certain URL patterns

// 0 0 0 0 0 0 0 0 0 0
// Here the app.get will be executed when server started with: "sudo node server2.js" or 
// "sudo node server2.js&". When thid will be run it will register a event handler 
// function to be run AFTER client has sent a request with the URL '/hello'.
// So JavaScriptish way part of the code below will be run directly, part is definition
// of code that WILL be run LATER if an event will happen. E.g. System will do a 
// call-back or relay a button click to us.

app.get('/', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("Hello World from Node.js Back-end ideacasedemo");
});

// List categories
app.get('/category/all', function (req, res) {
    jsonfile.readFile(FILEPATH)
        .then(obj => res.send(obj))
        .catch(res => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("Reading JSON from server file system FAILED.");
        })
});


// 3 3 3 3 3 3 3 3 3 3   GET -- data visible in the url BAD
app.get('/category/add', function (req, res) {
    var id = req.query.id;
    var name = req.query.name;
    var budget = req.query.budget;
    console.log(req.query);
    console.log("Adding with GET - name: " + name + " budget: " + budget);   // ZZZZZ
    addCategory(req, res, id, name, budget, FILEPATH);
})

// 3 3 3 3 3 3 3 3 3 3   POST -- prefered way to add data - need encryption
app.post('/category/add', function (req, res) {
    var id = req.body.id;
    var name = req.body.name;
    var budget = req.body.budget;
    console.log("Adding with POST - name: " + name + " budget: " + budget);   // ZZZZZ
    addCategory(req, res, id, name, budget, FILEPATH);
})

// the parameters include id, name, budget so that both POST and GET method can use this function
function addCategory(req, res, id, name, budget, filepath) {
    "use strict";
    if (budget !== 0 && !budget) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end("Error: Budget cannot be missing!");
    } else if (budget < 0) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end("Error: Budget cannot be below zero!");
    } else if (!name || name.length === 0) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end("Error: Name cannot be empty!");
    } else {
        addItemToJson(res, { id: id, name: name, budget: budget }, filepath);
    }
}

// call-back way ==> NOT GOOD
// function addItemToJson(newItem, filepath) {
//     jsonfile.readFile(filepath, function (err, obj) {
//         obj.push(newItem);
//         jsonfile.writeFile(filepath, obj, function (err) {
//             if (err) console.error(err)
//         });
//     });
// }

// Using promise - BETTER
function addItemToJson(res, newItem, filepath) {
    jsonfile.readFile(filepath)
        .then(obj => {
            obj.push(newItem);
            return obj;
        })
        .then(obj =>
            jsonfile.writeFile(filepath, obj)
                .then(() => {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end("Writing JSON to server file system OK.");
                })
                .catch(() => {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end("Writing JSON to server file system FAILED.");
                })
        )
        .catch(() => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("Reading JSON from server file system FAILED.");
        })
}

// 4 4 4 4 4 4 4 4 4 4 search for 1 item in the database with either id or name as search term
app.get('/category', function (req, res) {
    var accessor = Object.keys(req.query)[0];
    var key = req.query[accessor];
    console.log("Search using " + accessor + ": " + key);  // ZZZZZ
    "use strict";
    if (!key || key.length === 0) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(key + " cannot be empty!");
    } else {
        searchForItem(req, res, key, accessor, FILEPATH);
    };
});

function searchForItem(req, res, key, accessor, filepath) {
    var index;
    jsonfile.readFile(filepath)
        .then(array => {
            for (index in array) {
                if (array[index][accessor] == key) {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end("Item with " + accessor + ": " + key + " found: " + JSON.stringify(array[index]));
                    break;
                }
            }
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end("Item with " + accessor + ": " + key + " not found!");
        })
        .catch(() => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("Error! Reading JSON from server file system FAILED.");
        })
}

// delete category
app.post('/category/delete', function (req, res) {
    deleteItem(req, res, FILEPATH);
});

function deleteItem(req, res, filepath) {
    jsonfile.readFile(filepath)
        .then(array => {
            array = array.filter(category => category.id !== req.body.id);
            jsonfile.writeFile(filepath, array)
                .then(() => {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end("Item " + JSON.stringify(req.body) + " deleted!");
                })
                .catch(() => {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end("Updating data to server file system FAILED.");
                })
        })
        .catch(() => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("Error! Reading JSON from server file system FAILED.");
        })
}

var server = app.listen(8989, function () {
    "use strict";
    var host = server.address().address;
    var port = server.address().port;

    console.log("ideacasedemo app listening at http://%s:%s", host, port);
});