"use strict";var Model={currentMarker:ko.observable(null),markers:ko.observableArray()},ViewModel=function(){function e(){for(var e=0;e<Model.markers().length;e++)Model.markers()[e].highlight(!1);Model.currentMarker(null)}var o,t,r,n,a=this;this.defaultloc=ko.observable("Duluth, GA"),this.defaultsearch=ko.observable("dog run"),a.mapUnavailable=ko.observable(!1),a.query=ko.observable("");!function(){if("object"==typeof window.google&&"object"==typeof window.google.maps){var l={disableDefaultUI:!0};o=new google.maps.Map(document.getElementById("map"),l),t=new google.maps.Geocoder,r=new google.maps.LatLngBounds,n=new google.maps.InfoWindow({content:null});var s="&query="+a.defaultsearch(),i="&near="+a.defaultloc(),u="https://api.foursquare.com/v2/venues/explore?&client_id=KEMJ033J04CMFDVEZR0OJJRJA2G2PMOLQ4YQBO30G0DG2RJC&client_secret= RU514EIHAK4IXLJSG4HGSJ0OC3L3QE0BX2KXBR1E40LM40JZ&v=20150501&venuePhotos=1"+i+s;$.getJSON(u,function(a){for(var l=a.response.groups[0].items,s=0;s<l.length;s++){var i=new google.maps.LatLng(l[s].venue.location.lat,l[s].venue.location.lng),u=(l[s].venue.rating,new google.maps.Marker({position:i,map:o,animation:google.maps.Animation.DROP,title:l[s].venue.name,url:l[s].venue.url,highlight:ko.observable(!1),fsRating:l[s].venue.rating}));google.maps.event.addListener(u,"click",function(){var r=this;t.geocode({latLng:r.position},function(e,o){if(o==google.maps.GeocoderStatus.OK){if(e[0]){var t=e[0].formatted_address,a="http://maps.googleapis.com/maps/api/streetview?size=200x150&location="+t,l=t.indexOf(",");n.setContent("<span class='title'>"+r.title+"</span><br>"+t.slice(0,l)+"<br>"+t.slice(l+1)+"<br><a href="+r.url+">"+r.url+"</a><br><img src='"+a+"'><br><strong>Foursquare Rating: </strong>"+r.fsRating)}}else n.setContent("<span class='title'>"+r.title+"</span><br><<Can't find address :-(>><br><a href="+r.url+">"+r.url+"</a><br>")}),n.open(o,r),e(),r.highlight(!0),o.panTo(r.position),Model.currentMarker(r)}),google.maps.event.addListener(n,"closeclick",function(){e(),o.panTo(r.getCenter()),o.fitBounds(r)}),r.extend(i),Model.markers.push(u)}o.fitBounds(r),o.setCenter(r.getCenter())}).error(function(){alert("Please check your Internet connection. Please try it later!"),console.log("error")})}else a.mapUnavailable(!0)}();a.filteredArray=ko.computed(function(){return ko.utils.arrayFilter(Model.markers(),function(e){return-1!==e.title.toLowerCase().indexOf(a.query().toLowerCase())})},a),a.filteredArray.subscribe(function(){var e=ko.utils.compareArrays(Model.markers(),a.filteredArray());ko.utils.arrayForEach(e,function(e){e.value.setMap("deleted"===e.status?null:o)})}),a.selectItem=function(e){google.maps.event.trigger(e,"click")}};ko.applyBindings(new ViewModel);
