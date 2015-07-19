var Model = {
  currentMarker: ko.observable(null),
  markers: ko.observableArray()
}

var ViewModel = function(){
  var self = this;
  var map, geocoder, bounds, infowindow;
  // Default location for the map
  this.defaultloc = ko.observable("Duluth, GA");

// Default Foursquare venue for the search
  this.defaultsearch = ko.observable ("dog run");

  self.mapUnavailable = ko.observable(false);
  self.query = ko.observable('');

  // Initialize Map and markers, then push to Model

  var initMap = function() {
  /** error check, if google maps is available
    */
    if(typeof window.google === 'object' && typeof window.google.maps === 'object') {

      var mapOptions = {
        disableDefaultUI: true
      };

      map = new google.maps.Map(document.getElementById('map'), mapOptions);
      geocoder = new google.maps.Geocoder();
      bounds = new google.maps.LatLngBounds();
      infowindow = new google.maps.InfoWindow({
        content: null
      });
      //Venue category for the API request. Also allows to change the value for the venue without having to touch the API string
        var query = '&query=' + self.defaultsearch();

      //Default location for the API's request.
        var nearloc = '&near=' + self.defaultloc();

        var API_ENDPOINT = 'https://api.foursquare.com/v2/venues/explore?' +
                  '&client_id=KEMJ033J04CMFDVEZR0OJJRJA2G2PMOLQ4YQBO30G0DG2RJC' +
                  '&client_secret= RU514EIHAK4IXLJSG4HGSJ0OC3L3QE0BX2KXBR1E40LM40JZ' +
                  '&v=20150501&venuePhotos=1' + nearloc + query;


        $.getJSON(API_ENDPOINT, function(data) {
                  var fsPlaces = data.response.groups[0].items;

                  for (var i = 0; i < fsPlaces.length; i++) {
                      var fsPosition = new google.maps.LatLng(fsPlaces[i].venue.location.lat, fsPlaces[i].venue.location.lng);
                      var rating = fsPlaces[i].venue.rating;
                      var marker = new google.maps.Marker({
                        position: fsPosition,
                        map: map,
                        animation: google.maps.Animation.DROP,
                        title: fsPlaces[i].venue.name,
                        url: fsPlaces[i].venue.url,
                        highlight: ko.observable(false),
                        fsRating: fsPlaces[i].venue.rating
                      });

                      google.maps.event.addListener(marker, 'click', function() {
                        var that = this;
                        //added google geocoder for a better address result
                        geocoder.geocode({'latLng': that.position}, function(results, status) {
                          if(status == google.maps.GeocoderStatus.OK) {
                            if (results[0]){
                              var address = results[0].formatted_address;
                              var streetviewURL = "http://maps.googleapis.com/maps/api/streetview?size=200x150&location=" + address + "";
                              var split = address.indexOf(',');
                              infowindow.setContent("<span class='title'>" + that.title +
                                "</span><br>" + address.slice(0,split) + "<br>" +
                                (address.slice(split+1)) +
                                "<br><a href=" + that.url + ">" + that.url + "</a><br>" + "<img src='" + streetviewURL + "'><br><strong>Foursquare Rating: </strong>" + that.fsRating +"" );
                            }
                          } else {
                            infowindow.setContent("<span class='title'>" + that.title +
                              "</span><br><<Can't find address :-(>><br><a href=" +
                              that.url + ">" + that.url + "</a><br>");
                          }
                        });
                        // open infoWindow and clear markers
                        infowindow.open(map, that);
                        clearMarkers();

                        // Modify marker (and list) to show selected status.
                        that.highlight(true);

                        // Move map viewport to center selected item.
                        map.panTo(that.position);
                        Model.currentMarker(that);
                      });

                      /** click event to close infowindow
                        * This function will clear any selected markers,
                        * center the map to show all markers on the map.
                        */
                      google.maps.event.addListener(infowindow, 'closeclick', function() {
                        clearMarkers();
                        map.panTo(bounds.getCenter());
                        map.fitBounds(bounds);
                      });

                      // Modify map viewport to include new map marker
                      bounds.extend(fsPosition);

                      //Add marker to array
                      //self.markerArray.push(marker);
                      Model.markers.push(marker);
                    }

                    map.fitBounds(bounds);
                    map.setCenter(bounds.getCenter());

                  });

                } else {
                    //if no google object found, display error div
                  self.mapUnavailable(true);
                }
              }();

                /** filter and return items that match query
                  */
                  self.filteredArray = ko.computed(function() {
                    return ko.utils.arrayFilter(Model.markers(), function(marker) {
                      return marker.title.toLowerCase().indexOf(self.query().toLowerCase()) !== -1;
                    });
                  }, self);

                /** Subscribing to the filteredArray changes will allow for showing or hiding
                  * the associated markers on the map itself.
                  */
                  self.filteredArray.subscribe(function() {
                    var diffArray = ko.utils.compareArrays(Model.markers(), self.filteredArray());
                    ko.utils.arrayForEach(diffArray, function(marker) {
                      if (marker.status === 'deleted') {
                        marker.value.setMap(null);
                      } else {
                        marker.value.setMap(map);
                      }
                    });
                  });

                //Highlight map marker if list item is clicked.
                self.selectItem = function(listItem) {
                  google.maps.event.trigger(listItem, 'click');
                };

                /** reset all markers, clear color in list and reset the currentMarker variable.
                */
                function clearMarkers() {
                  for(var x = 0; x < Model.markers().length; x++){
                   Model.markers()[x].highlight(false);
                 }
                 Model.currentMarker(null);
               }
              };

ko.applyBindings(new ViewModel());
