/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */

const barnowl = require('barnowl');
const reelib = require('reelib');


/**
 * ReelyActive Class
 * Handles BLE detection using the reelyActive platform.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function ReelyActive(options) {
  var self = this;
  options = options || {};

  // Accept the socket.io server for emitting events
  self.io = options.socket;

  // Initialise reelyActive barnowl and listen for BLE over serial (USB)
  self.middleware = new barnowl( { n: 3, enableMixing: true } );
  self.middleware.bind( { protocol: 'serial', path: 'auto' } );
  initialiseEventHandlers(self);

  // Initially there is no device present
  self.presentDevice = { rssi: 0 };
}


/**
 * Initialise the event handlers of the reelyActive barnowl.
 * @param {ReelyActive} instance The given ReelyActive instance.
 */
function initialiseEventHandlers(instance) {

  // On visibilityEvent, handle the tiraid
  instance.middleware.on('visibilityEvent', function(tiraid) {
    handleVisibilityEvent(instance, tiraid);
  });
}


/**
 * Handle the given visibilityEvent
 * @param {ReelyActive} instance The given ReelyActive instance.
 * @param {Object} tiraid The tiraid associated with the visibilityEvent.
 */
function handleVisibilityEvent(instance, tiraid) {
  var event = reelib.tiraid.toFlattened(tiraid);

  // Is this the current present device?
  if(event.deviceId === instance.presentDevice.deviceId) {
    event.deviceAssociationIds = reelib.tiraid.getAssociationIds(tiraid);
    event.startTime = instance.presentDevice.startTime;
    instance.presentDevice = event; // TODO: merge deviceAssociationIds
    updatePresenceTimeout(event);
    instance.io.emit('radio-presence', event);
  }

  // Otherwise, does this device have a stronger RSSI?
  else if(event.rssi > instance.presentDevice.rssi) {
    event.deviceAssociationIds = reelib.tiraid.getAssociationIds(tiraid);
    event.startTime = event.time;
    instance.presentDevice = event;
    updatePresenceTimeout(event);
    instance.io.emit('radio-presence', event);
  }
}


/**
 * Update the timeout of presence expiry
 * @param {ReelyActive} instance The given ReelyActive instance.
 * @param {Object} event The most recent event of the present device.
 */
function updatePresenceTimeout(instance, event) {
  // TODO: this!
}


module.exports = ReelyActive;
