function initialize() {
  var mapOptions = {
    zoom: 16,
    center: new google.maps.LatLng(34, -84)
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);

  if (!map) {
    alert("Unfortunately Google Maps is experiencing technical difficulties. Please Try again later!");
  return;
  }
  var image = 'images/dog-offleash.png';
  var myLatLng = new google.maps.LatLng(34.002879, -84.14463);
  var dogMarker = new google.maps.Marker({
      position:myLatLng,
      map: map,
      icon: image
  });
}

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' +
      '&signed_in=true&callback=initialize';
  document.body.appendChild(script);
}

window.onload = loadScript;