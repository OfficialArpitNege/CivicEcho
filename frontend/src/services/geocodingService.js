/**
 * Client-side reverse geocoding using OpenStreetMap Nominatim API
 * No API key required, CORS enabled for basic usage
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

/**
 * Reverse geocode coordinates to get address
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<string>} Address string or formatted coordinates
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    // Add delay to respect Nominatim API rate limit (1 request per second)
    await new Promise(resolve => setTimeout(resolve, 1100));

    const response = await fetch(
      `${NOMINATIM_URL}?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CivicEcho App (https://civicecho.app)',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.address) {
      // Build a readable address from the components
      const addr = data.address;
      const addressParts = [];

      // Road/street
      if (addr.road || addr.pedestrian || addr.footway) {
        addressParts.push(addr.road || addr.pedestrian || addr.footway);
      }

      // Neighbourhood/suburb
      if (addr.neighbourhood || addr.suburb) {
        addressParts.push(addr.neighbourhood || addr.suburb);
      }

      // City/town/village
      if (addr.city || addr.town || addr.village) {
        addressParts.push(addr.city || addr.town || addr.village);
      }

      // State/province
      if (addr.state) {
        addressParts.push(addr.state);
      }

      // Country
      if (addr.country) {
        addressParts.push(addr.country);
      }

      const formattedAddress = addressParts.join(', ');
      console.log(`✅ Geocoded address: ${formattedAddress}`);
      return formattedAddress || data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }

    // Fallback to display_name if available
    if (data && data.display_name) {
      console.log(`✅ Using display_name: ${data.display_name}`);
      return data.display_name;
    }

    // Last resort: return coordinates
    console.warn(`⚠️ Could not geocode coordinates, returning formatted coordinates`);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.warn(`⚠️ Reverse geocoding failed: ${error.message}, using coordinates instead`);
    // Return formatted coordinates as fallback - don't throw error
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

/**
 * Reverse geocode with caching to avoid repeated API calls
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {Map} cache - Optional cache Map for storing results
 * @returns {Promise<string>} Address string or formatted coordinates
 */
export const reverseGeocodeWithCache = async (latitude, longitude, cache = new Map()) => {
  const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  
  // Check cache first
  if (cache.has(key)) {
    console.log(`✅ Using cached address for ${key}`);
    return cache.get(key);
  }

  // Get fresh address
  const address = await reverseGeocode(latitude, longitude);
  
  // Store in cache
  cache.set(key, address);
  
  return address;
};

// Shared cache for the session
const addressCache = new Map();

/**
 * Reverse geocode with automatic session-level caching
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<string>} Address string or formatted coordinates
 */
export const reverseGeocodeWithSessionCache = async (latitude, longitude) => {
  return reverseGeocodeWithCache(latitude, longitude, addressCache);
};
