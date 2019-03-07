/*  No need to be able to create this back-end, just
    be able to read it for understanding how the 
    client must call it and what can it expect as response!

    server2.js, where the back-end is defined.

   1. First the modules it needs in its web services,
   2. Then the web services defined: URL pattern => handler function, 
   3. And at the end, starting the server and 
      making it to listen to port 80

   To start the web server for real, we need to run this
   command on server command line, in the folder of this file:
   > sudo node server2.js
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
    var returnValue = addCategory(req, res, id, name, budget, FILEPATH);
    res.writeHead(Number(returnValue.HttpStatusCode), { 'Content-Type': 'text/plain' });
    res.end(returnValue.HttpStatusCode + " " + returnValue.Message.toString());
})

// 3 3 3 3 3 3 3 3 3 3   POST -- prefered way to add data - need encryption
app.post('/category/add', function (req, res) {
    var id = req.body.id;
    var name = req.body.name;
    var budget = req.body.budget;
    console.log("Adding with POST - name: " + name + " budget: " + budget);   // ZZZZZ
    var returnValue = addCategory(req, res, id, name, budget, FILEPATH);
    res.writeHead(Number(returnValue.HttpStatusCode), { 'Content-Type': 'text/plain' });
    res.end(returnValue.HttpStatusCode + " " + returnValue.Message.toString());
})

function addCategory(req, res, id, name, budget, filepath) {
    "use strict";
    var returnValue;
    if (budget !== 0 && !budget) {
        console.log(req.body);
        returnValue = { "HttpStatusCode": "400", "Message": "Error: Budget cannot be missing!" };
    } else if (budget < 0) {
        returnValue = { "HttpStatusCode": "400", "Message": "Error: Budget cannot be below zero!" };
    } else if (!name || name.length === 0) {
        returnValue = { "HttpStatusCode": "400", "Message": "Error: Name cannot be empty!" };
    } else {
        switch (name) {
            case 'Alfred':
                returnValue = { "HttpStatusCode": "409", "Message": "Error: Alfred already in database!" };
                break;
            case 'Errol':
                returnValue = { "HttpStatusCode": "500", "Message": "Error: Some server error inserting Errol!" };
                break;
            case 'Conrad':
                returnValue = { "HttpStatusCode": "502", "Message": "Error: Connection to secondary server could not be established for Conrad!" };
                break;
            case 'Deborah':
                returnValue = { "HttpStatusCode": "503", "Message": "Error: Database not available for Deborah!" };
                break;
            default:
                addItemToJson({ id: id, name: name, budget: budget }, filepath);
                returnValue = { "HttpStatusCode": "200", "Message": "Success: Added " + id + ', ' + name + ', ' + budget + "." };
                break;
        }
    }

    return returnValue;
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
function addItemToJson(newItem, filepath) {
    jsonfile.readFile(filepath)
        .then(obj => {
            obj.push(newItem);
            return obj;
        })
        .then(obj =>
            jsonfile.writeFile(filepath, obj)
                .then((req, res) => {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end("Writing JSON to server file system OK.");
                })
                .catch(res => {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end("Writing JSON to server file system FAILED.");
                })
        )
        .catch(res => {
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
    var returnValue;

    if (!key || key.length === 0) {
        console.log("enter if code check key");
        returnValue = { "HttpStatusCode": "400", "Message": key + " cannot be empty!" };
        res.writeHead(Number(returnValue.HttpStatusCode), { 'Content-Type': 'text/plain' });
        res.end(returnValue.Message.toString());
    } else {
        console.log("if code check key not true, enter else"); // some problem with promises, the function is run after if(returnValue.HttpStatusCode)
        returnValue = searchForItem(key, accessor, FILEPATH);
        console.log("searchforItem done");
        console.log("httpstatuscode now is: " + returnValue.HttpStatusCode);
        if(Number(returnValue.HttpStatusCode) == 200) {
            res.writeHead(Number(returnValue.HttpStatusCode), { 'Content-Type': 'text/plain' });
            res.end(returnValue.HttpStatusCode + " " + returnValue.Message.toString());
            res.end(JSON.stringify(returnValue.Data));  // If found, just writing back the JSONF
        }
        else {
            res.writeHead(Number(returnValue.HttpStatusCode), { 'Content-Type': 'text/plain' });
            res.end(returnValue.HttpStatusCode + " " + returnValue.Message.toString());
        }
    };
});

function searchForItem(key, accessor, filepath) {
    var index, returnValue;
    jsonfile.readFile(filepath)
        .then(array => {
            console.log("Start searching through the database");
            for (index = 0; index < array.length; index = index + 1) {
                // console.log("Item " + index + " contains value: " + array[index][accessor]);   // ZZZZZ
                if (array[index][accessor] == key) {
                    returnValue = {
                        "HttpStatusCode": "200",
                        "Message": "Item with " + accessor + ": " + key + " found.",
                        "Data": { "id": array[index].id, "name": array[index].name, "budget": array[index].budget }
                    };
                    break;
                } else {
                    returnValue = {
                        "HttpStatusCode": "404",
                        "Message": "Item with " + accessor + ": " + key + " not found."
                    };
                }
            }
        })
        .catch(obj => {
            returnValue = {
                "HttpStatusCode": "500",
                "Message": "Error accessing database."
            }
        })

    return returnValue;
}

// delete category

var server = app.listen(8989, function () {
    "use strict";
    var host = server.address().address;
    var port = server.address().port;

    console.log("ideacasedemo app listening at http://%s:%s", host, port);
});