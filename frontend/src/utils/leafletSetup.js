import L from 'leaflet';

// Fix for Leaflet marker icons in production
// This overrides the default icon behavior to use the SVG assets in public/leaflet
const defaultIcon = new L.Icon({
  iconUrl: '/leaflet/marker-icon.svg',
  iconRetinaUrl: '/leaflet/marker-icon.svg', // use same icon for retina
  shadowUrl: '/leaflet/marker-shadow.svg',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Apply to all markers by default
L.Marker.prototype.options.icon = defaultIcon;
