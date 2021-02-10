/* eslint-disable */
// import { mapboxgl } from 'mapbox-gl';
// MAP IMPLEMENTATION using mapBox.js
export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibTkwa2hhbiIsImEiOiJja2ZtMmh6Z2cyOG9mMnFvM2Y5dnVveWIzIn0.7wFc6ZiczTANeQUR4HevQg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/m90khan/ckfm3ozag1wzy19l2gh2q6fno',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(location => {
    // Create marker
    const el = document.createElement('div');
    el.style.backgroundImage = "url('../img/pin.png')";
    // el.style.backgroundSize = 'cover';
    // el.style.height = '40px';
    // el.style.width = '40px';

    el.className = 'marker'; // marker is defined in css with a background image
    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom' // bottom of the image element on the map position
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
