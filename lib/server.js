/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const quividi = require('./quividi');
const reelyactive = require('./reelyactive');


const HTTP_PORT = 3000;


// Create the Express app, server and router
var app = express();
var server = http.createServer(app);
var router = express.Router();

// Define the Express routes
app.use('/', express.static(__dirname + '/../web'));
app.use('/', router);

// Fire up the webserver
server.listen(HTTP_PORT, function() {
  console.log('quividi-reelyactive-demo running on localhost:' + HTTP_PORT);
});

// Fire up the socket.io server
var io = socketio(server);

// Instantiate the Quividi and reelyActive managers
var quividiManager = new quividi( { socket: io } );
var reelyActiveManager = new reelyactive( { socket: io } );
