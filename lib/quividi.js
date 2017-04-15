/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */

const w3cwebsocket = require('websocket').w3cwebsocket;


const QUIVIDI_PORT = 2974;
const QUIVIDI_PROTOCOL = 'quividi';


/**
 * Quividi Class
 * Handles facial analysis using the Quividi platform.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function Quividi(options) {
  var self = this;
  options = options || {};

  // Accept the socket.io server for emitting events
  self.io = options.socket;

  // Initialise the Quividi websocket client (VidiReports)
  self.ws = new w3cwebsocket('ws://localhost:' + QUIVIDI_PORT, QUIVIDI_PROTOCOL);
  initialiseEventHandlers(self);
}


/**
 * Initialise the event handlers of the Quividi websocket.
 * @param {Quividi} instance The given Quividi instance.
 */
function initialiseEventHandlers(instance) {

  // On connection, send a request to receive motion events
  instance.ws.onopen = function() {
  	instance.ws.send('motion');
  };

  // On message, handle the message
  instance.ws.onmessage = function(message) {
    if((typeof message.data === 'string') && (message.data !== 'OK')) {
      var event = JSON.parse(message.data);
      if(event.hasOwnProperty('motion_event')) {
        handleMotionEvent(instance, event.motion_event);
      }
    }
  };

  // On close, TODO: notify via the UI
  instance.ws.onclose = function() {
    console.log('Connection to Quividi websocket closed');
  };
}


/**
 * Handle the given motion_event
 * @param {Quividi} instance The given Quividi instance.
 * @param {Object} event The motion_event.
 */
function handleMotionEvent(instance, event) {
  instance.io.emit('video-presence', event);
}


module.exports = Quividi;
