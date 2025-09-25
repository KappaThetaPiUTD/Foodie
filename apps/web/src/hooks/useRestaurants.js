import { useState, useCallback } from 'react';

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState([]);

  const findRestaurants = useCallback((
    myPreferences, 
    peerPreferences, 
    peerOriginText, 
    originInputRef, 
    mapRef, 
    broadcastFn, 
    saveFn,
    sendOriginUpdate
  ) => {
    if (!window.google || !mapRef.current) return;
    
    sendOriginUpdate();

    const originText = originInputRef.current?.value?.trim();
    if (!originText) {
      alert('Please enter your start location.');
      return;
    }
    
    const peerText = (peerOriginText || '').trim();
    if (!peerText) {
      alert('Waiting for the other person\'s start location.');
      return;
    }

    // Normalize and find common cuisines
    const norm = (arr) => (arr || []).map((s) => String(s).toLowerCase().trim());
    const mine = norm(myPreferences.cuisines);
    const peer = norm(peerPreferences.cuisines);

    let common = [];
    if (mine.length === 0 && peer.length === 0) {
      alert('No cuisines selected. Please choose at least one.');
      setRestaurants([]);
      return;
    } else if (mine.length === 0) {
      common = peer;
    } else if (peer.length === 0) {
      common = mine;
    } else {
      const mySet = new Set(mine);
      common = peer.filter((c) => mySet.has(c));
    }

    if (!common.length) {
      alert('No overlapping cuisines. Please align selections.');
      setRestaurants([]);
      return;
    }

    const cuisine = common[0];

    // Geocoding helper
    const geocode = (address) => new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (res, status) => {
        if (status === google.maps.GeocoderStatus.OK && res?.[0]) {
          const loc = res[0].geometry.location;
          resolve({ lat: loc.lat(), lng: loc.lng() });
        } else {
          reject(new Error('geocode failed'));
        }
      });
    });

    // Haversine distance calculation
    const haversineKm = (p1, p2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (p2.lat - p1.lat) * Math.PI / 180;
      const dLng = (p2.lng - p1.lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    (async () => {
      try {
        // Geocode both locations
        const [userA, userB] = await Promise.all([
          geocode(originText), 
          geocode(peerText)
        ]);
        
        // Calculate midpoint
        const midpoint = {
          lat: (userA.lat + userB.lat) / 2,
          lng: (userA.lng + userB.lng) / 2
        };

        // Build search request
        const request = {
          location: new google.maps.LatLng(midpoint.lat, midpoint.lng),
          radius: 7000,
          type: 'restaurant',
          query: `${cuisine} restaurant`,
          openNow: myPreferences.openNow || undefined,
        };

        // Add price level if specified
        const priceIndex = { '$': 0, '$$': 1, '$$$': 2, '$$$$': 3 }[myPreferences.price];
        if (priceIndex !== undefined) {
          request.minPriceLevel = priceIndex;
          request.maxPriceLevel = priceIndex;
        }

        // Search for restaurants
        const service = new google.maps.places.PlacesService(mapRef.current);
        service.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const kw = cuisine.toLowerCase();
            
            // Filter results
            const filtered = results.filter((place) => {
              const name = (place.name || '').toLowerCase();
              const types = (place.types || []).map(t => t.toLowerCase());
              return name.includes(kw) || types.some(t => t.includes(kw) || t.includes('restaurant'));
            });

            // Serialize and calculate distances
            const serialized = filtered.map((place) => ({
              placeId: place.place_id,
              name: place.name,
              rating: place.rating,
              userRatingsTotal: place.user_ratings_total,
              address: place.formatted_address,
              location: {
                lat: place.geometry?.location?.lat?.() || null,
                lng: place.geometry?.location?.lng?.() || null
              }
            })).filter((x) => x.location.lat != null && x.location.lng != null);

            // Sort by fairness (sum of distances to both users)
            const withDistances = serialized.map((restaurant) => {
              const d1 = haversineKm(userA, restaurant.location);
              const d2 = haversineKm(userB, restaurant.location);
              return { ...restaurant, sumDistanceKm: d1 + d2 };
            }).sort((a, b) => a.sumDistanceKm - b.sumDistanceKm);

            setRestaurants(withDistances);

            // Save and broadcast results
            if (saveFn) {
              saveFn({ restaurants: withDistances });
            }
            if (broadcastFn) {
              broadcastFn({ type: 'restaurantsUpdate', payload: withDistances });
            }

            // Pan map to first result
            if (withDistances[0]) {
              mapRef.current?.panTo(withDistances[0].location);
            }
          } else {
            setRestaurants([]);
            if (saveFn) {
              saveFn({ restaurants: [] });
            }
            if (broadcastFn) {
              broadcastFn({ type: 'restaurantsUpdate', payload: [] });
            }
          }
        });
      } catch (e) {
        alert('Could not geocode one or both start locations.');
      }
    })();
  }, []);

  return {
    restaurants,
    setRestaurants,
    findRestaurants
  };
}
