// netlify/functions/nearby-places.js
// Proxy for Google Places API Nearby Search (New)
// Uses REACT_APP_GOOGLE_MAPS_KEY from Netlify env vars (server-side, so it's safe)

const fetch = require('node-fetch');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;
  if (!API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Google Maps API key not configured' }) };
  }

  try {
    const { address, type, radius } = JSON.parse(event.body);

    if (!address || !type) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing address or type' }) };
    }

    // Step 1: Geocode the address to get lat/lng
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
    const geoRes = await fetch(geocodeUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Address not found', results: [] }) };
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    // Step 2: Nearby Search using the Places API
    const searchRadius = radius || 5000; // default 5km
    const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${searchRadius}&type=${type}&key=${API_KEY}`;
    const nearbyRes = await fetch(nearbyUrl);
    const nearbyData = await nearbyRes.json();

    // Step 3: Format results
    const results = (nearbyData.results || []).slice(0, 10).map((place) => {
      // Calculate distance (Haversine formula)
      const R = 3959; // miles
      const dLat = ((place.geometry.location.lat - lat) * Math.PI) / 180;
      const dLng = ((place.geometry.location.lng - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) * Math.cos((place.geometry.location.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      // Photo URL
      let photoUrl = null;
      if (place.photos && place.photos.length > 0) {
        photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${API_KEY}`;
      }

      return {
        name: place.name,
        address: place.vicinity || '',
        rating: place.rating || null,
        totalRatings: place.user_ratings_total || 0,
        distance: Math.round(distance * 10) / 10, // 1 decimal
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        photoUrl,
        priceLevel: place.price_level || null,
        isOpen: place.opening_hours?.open_now ?? null,
        placeId: place.place_id,
        types: place.types || [],
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        results,
        center: { lat, lng },
        formattedAddress: geoData.results[0].formatted_address,
      }),
    };
  } catch (error) {
    console.error('Nearby places error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch nearby places' }),
    };
  }
};
