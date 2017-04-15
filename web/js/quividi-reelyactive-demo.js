/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


SNIFFYPEDIA_ROOT = 'https://sniffypedia.org/';
DEFAULT_STORY = { image: 'https://sniffypedia.org/Organization/Bluetooth_SIG_Inc/400x400.png' };


angular.module('demo', [ 'ui.bootstrap', 'btford.socket-io',
                         'reelyactive.cormorant' ])

  // socket.io connection for real-time analytics
  .factory('Socket', function(socketFactory, $location) {
    var url = $location.protocol() + '://' + $location.host() + ':' +
              $location.port();
    return socketFactory( { ioSocket: io.connect(url) } );
  })


  // Recognition controller
  .controller('RecognitionCtrl', function($scope, $http, $interval, Socket,
                                          cormorant) {
    $scope.presentStory = DEFAULT_STORY;

    Socket.on('radio-presence', function(event) {
      handleRadioPresenceEvent(event);
    });

    Socket.on('video-presence', function(event) {
      handleVideoPresenceEvent(event);
    }); 

    // Handle a radio presence event
    function handleRadioPresenceEvent(event) {
      event.presence = Math.round((event.time - event.startTime) / 1000);
      event.associations = makeDeviceAssociations(event.deviceAssociationIds);
      if(event.associations.length > 0) {
        fetchStory(event.associations[0]);
      }
      else {
        $scope.presentStory = DEFAULT_STORY;
      }
      $scope.radioAnalytics = event;
    }

    // Handle a video presence event
    function handleVideoPresenceEvent(event) {
      event.presence = Math.round(event.duration);
      event.attention = Math.round(100 * event.attention_time / event.duration);
      event.watching = ((parseInt(event.status) & 0x20) === 0x20);
      event.image = getVideoPresenceImage(event);
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
      return associations;
    }

    // Fetch the story of the given association
    function fetchStory(association) {
      var url = SNIFFYPEDIA_ROOT + association;
      cormorant.getStory(url, function(story) {
        $scope.presentStory =  { json: story };
        if(story.hasOwnProperty('@graph')) {
          $scope.presentStory.name = story['@graph'][0]['schema:name'];
          $scope.presentStory.image = story['@graph'][0]['schema:image'] ||
                                      story['@graph'][0]['schema:logo'];
        }
      });
    }

    // Get the appropriate image given the video demographics
    function getVideoPresenceImage(event) {
      if(event.glasses === 'no') {
        switch(event.mood) {
          case 'unhappy':
            return 'images/unhappy.jpg';
          case 'neutral':
            return 'images/neutral.jpg';
          case 'happy':
            return 'images/happy.jpg';
          case 'very_happy':
            return 'images/veryhappy.jpg';
        }
      }
      else {
        switch(event.mood) {
          case 'unhappy':
            return 'images/unhappy-glasses.jpg';
          case 'neutral':
            return 'images/neutral-glasses.jpg';
          case 'happy':
            return 'images/happy-glasses.jpg';
          case 'very_happy':
            return 'images/veryhappy-glasses.jpg';
        }
      }
    }

  });

