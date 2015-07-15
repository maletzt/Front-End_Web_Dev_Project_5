var googleMap;


function initialize() {
  var mapOptions = {
      zoom: 14,
      panControl: false,
      panControlOptions: {
          style: google.maps.ZoomControlStyle.DEFAULT,
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
          zoomControl: false,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        overviewMapControl: false,
        streetViewControl: false
    };

    try {
        googleMap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        $('#map-canvas').height($(window).height());
    } catch (err) {
        //If the Google Maps API does not respond, it will load this error.
        $('#map-canvas').hide();
        alert('There has been some technicial difficultly loading the map. Please double-check your internet connection and try again!');

    }
}
// Model for the location information

var LocationsInfo = function(item){
  this.name = ko.observable(item.venue.name);
  this.address = ko.observable(item.venue.location.formattedAddress);
  this.phone = ko.observable(item.venue.contact.formattedPhone);
  this.rating = ko.observable(item.venue.rating);
  this.category = ko.observable(item.venue.categories[0].name);
  this.sourceimg = ko.observable('https://irs0.4sqi.net/img/general/75x75' + item.venue.photos.groups[0].items[0].suffix);
};

// ViewModel for Knockout
var ViewModel = function(){
  var self = this;
// Array for the markers associated with the map
  var variousmarkers = [];

// Array for Points of Interest
  self.locationlist = ko.observableArray([]);

// Default location for the map
  this.defaultloc = ko.observable("Duluth, GA");

// Default Foursquare venue for the search
  this.defaultsearch = ko.observable ("dog");

// Diplay for the listings of Points of Interest
  self.showplaces = ko.observable('true');

// Infowindow setup
if (typeof google != "undefined") {
        var infowindow = new google.maps.InfoWindow();
    }

//  Sets the map boundaries based from the FourSquare API.
    function setMapBoundaries(prefferedbounds) {
       if (typeof google != "undefined") {
            //SouthWest and NorthEast coordinates
            var boundto = new google.maps.LatLngBounds(
              new google.maps.LatLng(prefferedbounds.sw.lat, prefferedbounds.sw.lng),
              new google.maps.LatLng(prefferedbounds.ne.lat, prefferedbounds.ne.lng));
           googleMap.fitBounds(boundto);
           // center the map
           googleMap.setCenter(boundto.getCenter());
        }

    }



// Search Function
self.searchLocations = function(){
  var all_locations = [];
  deleteMarkers();

  self.locationlist([]);


//Venue category for the API request. Also allows to change the value for the venue without having to touch the API string
  var query = '&query=' + self.defaultsearch();

//Sets to find the nearest places from the API's request.
  var nearloc = '&near=' + self.defaultloc();

  var API_ENDPOINT = 'https://api.foursquare.com/v2/venues/explore?' +
            '&client_id=KEMJ033J04CMFDVEZR0OJJRJA2G2PMOLQ4YQBO30G0DG2RJC' +
            '&client_secret= RU514EIHAK4IXLJSG4HGSJ0OC3L3QE0BX2KXBR1E40LM40JZ' +
            '&v=20150501&venuePhotos=1' + nearloc + query;


  $.getJSON(API_ENDPOINT, function(data) {
            var places = data.response.groups[0].items;
            setMapBoundaries(data.response.suggestedBounds);

            for (var i = 0; i < places.length; i++) {
                var item = places[i];
                console.log(item);
                //This will show the items list along with their pictures.
                if (item.venue.photos.groups.length !== 0) {
                    self.locationlist.push(new LocationsInfo(item));
                    all_locations.push(item.venue);
                }
            }

            //Sorts the list from highest to lowest ratings of each locations.
            self.locationlist.sort(function(left, right) {
                return left.rating() == right.rating() ? 0 : (left.rating() > right.rating() ? -1 : 1);
            });

            //Creates the markers on the map.
            markPlaces(all_locations);
        }).error(function(e) {
            //If FourSquare data isn't being retrieved due to WIFI or other connection issues, it will print out this error.
            alert('There has been some technicial difficultly. Please double-check your internet connection and try again!');
            console.log('error');
        });

    };

    //Will perform search.
    self.searchLocations();

    //This will create the infowindoes on the map.
    function createInfoWindow(data, marker) {

        /*The infowindow will consist of the locations, name, url, address, phone number, ratings,
         and street view images
         */
        var name = data.name;
        var locationurl = data.url;
        var address = data.location.address + ',' + data.location.city + ',' + data.location.country;
        var contact = data.contact.formattedPhone;
        var rating = data.rating;

        //Steetview image views along with their sizes.
        var streetviewlink = 'http://maps.googleapis.com/maps/api/streetview?size=200x100&location=' + address + '';

        //Creates infowindow contents
        var infocontent = '<div class="vinfowindow">' + '<div class="venuename">' + '<a href ="' + locationurl + '" target="_blank" >'
            + name + '</a>' + '<span class="vrating label-info badge">' + rating + '<sub> /10</sub>' + '</span>' + '</div>'
            + '<div class="vcontact"><span class="icon-phone"></span>' + contact + '</div>' + '<img class="otherimg" src="'
            + streetviewlink + '">' + '</div>';

        //If you click on the marker, the infowindow will be displayed.
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(infocontent);
            infowindow.open(googleMap, marker);
        });
    }

    //This will create the markers on the map.
    function createMarkers(data) {

        var name = data.name;
        var lat = data.location.lat;
        var lon = data.location.lng;

        if (typeof google != "undefined") {

            //Initializes the marker as an object with different behaviors.
            var marker = new google.maps.Marker({
                map: googleMap,
                title: name,
                position: new google.maps.LatLng(lat, lon),
                animation: google.maps.Animation.DROP
            });
            google.maps.event.addListener(marker, 'click', bouncing);

            //Saves the marker for each locations in this array
            variousmarkers.push(marker);

            createInfoWindow(data, marker);
        }

        //This will have the markers bounce for a short while once you click on them.
        function bouncing() {

            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){ marker.setAnimation(null); }, 2000);
            }
        }
    }

    //This will delete all the markers on the map.
    function deleteMarkers() {
        for (var i = 0; i < variousmarkers.length; i++) {
            variousmarkers[i].setMap(null);
        }

        //Resets the markers.
        variousmarkers = [];
    }

    //This will take the marked places as an array from the FourSquare API and creates the markers to each location.
    function markPlaces(mp) {
        // call createMarkers for places
        for (var i in mp) {
            createMarkers(mp[i]);
        }
    }

    //If the list of items is clicked, it will find the marker on the map.
    self.focusMarker = function(venue) {
        var venuename = venue.name();
        for (var i = 0; i < variousmarkers.length; i++) {
            if (variousmarkers[i].title == venuename) {
                google.maps.event.trigger(variousmarkers[i], 'click');
                googleMap.panTo(variousmarkers[i].position);
            }
        }

       };


};

//This will first initialize the map and apply the bindings for ViewModel().
$(document).ready(function() {

    initialize();
    ko.applyBindings(new ViewModel());

});