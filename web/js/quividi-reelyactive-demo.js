/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */

angular.module('demo', [ 'ui.bootstrap', 'btford.socket-io' ])

  // socket.io connection for real-time analytics
  .factory('Socket', function(socketFactory, $location) {
    var url = $location.protocol() + '://' + $location.host() + ':' +
              $location.port();
    return socketFactory( { ioSocket: io.connect(url) } );
  })


  // Recognition controller
  .controller('RecognitionCtrl', function($scope, $http, $interval, Socket) {

    Socket.on('radio-presence', function(event) {
      handleRadioPresenceEvent(event);
    });

    Socket.on('video-presence', function(event) {
      handleVideoPresenceEvent(event);
    }); 

    // Handle a radio presence event
    function handleRadioPresenceEvent(event) {
      event.associations = makeDeviceAssociations(event.deviceAssociationIds);
      $scope.radioAnalytics = event;
    }

    // Handle a video presence event
    function handleVideoPresenceEvent(event) {
      event.presence = Math.round(event.duration);
      event.attention = Math.round(100 * event.attention_time / event.duration);
      event.watching = ((parseInt(event.status) & 0x20) === 0x20);
      $scope.videoAnalytics = event;
    }

    // Make Sniffypedia associations, if possible
    function makeDeviceAssociations(identifiers) {
      var associations = [];
      for(var cId = 0; cId < identifiers.length; cId++) {
        var id = identifiers[cId];
        if(sniffypedia_index.ble.uuid16.hasOwnProperty(id)) {
          associations.push(sniffypedia_index.ble.uuid16[id]);
        }
        else if(sniffypedia_index.ble.uuid128.hasOwnProperty(id)) {
          associations.push(sniffypedia_index.ble.uuid128[id]);
        }
        else if(sniffypedia_index.ble.companyIdentifiers.hasOwnProperty(id)) {
          associations.push(sniffypedia_index.ble.companyIdentifiers[id]);
        }
        else if(sniffypedia_index.ble.iBeacons.hasOwnProperty(id)) {
          associations.push(sniffypedia_index.ble.iBeacons[id]);
        }
      }
      console.log(associations);
      return associations;
    }

  });

