import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer, MarkerF, InfoWindow } from '@react-google-maps/api';
import { useCallback, useEffect, useRef, useState } from 'react';

const containerStyle = {
  width: '100%',
  height: '60vh',
  borderRadius: 12,
  overflow: 'hidden',
};

export default function Map() {
  const originAutocomplete = useRef(null);
  const destinationAutocomplete = useRef(null);
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const sessionInputRef = useRef(null);
  const bcRef = useRef(null);

  const [center, setCenter] = useState({ lat: 32.8998, lng: -97.0403 });
  const [myDirections, setMyDirections] = useState(null);
  const [peerDirections, setPeerDirections] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [joined, setJoined] = useState(false);

  const cuisineOptions = [
    'Pizza','Sushi','Burgers','Mexican','Italian','Chinese','Indian','Thai','BBQ','Vegan'
  ];
  const [myPreferences, setMyPreferences] = useState({ cuisines: [], price: 'any', openNow: false });
  const [peerPreferences, setPeerPreferences] = useState({ cuisines: [], price: 'any', openNow: false });
  const [lastRoute, setLastRoute] = useState({ origin: '', destination: '' });
  const [restaurants, setRestaurants] = useState([]); // [{ placeId, name, rating, userRatingsTotal, address, location:{lat,lng} }]
  const [selectedPlace, setSelectedPlace] = useState(null); // same shape as restaurants item
  const mapRef = useRef(null);
  const [peerOriginText, setPeerOriginText] = useState('');
  const sendOriginUpdate = useCallback(() => {
    const val = originInputRef.current?.value?.trim() || '';
    if (sessionId) {
      const key = `foodie:session:${sessionId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({ ...existing, myOriginText: val, updatedAt: Date.now() }));
    }
    if (joined && bcRef.current) {
      bcRef.current.postMessage({ type: 'originUpdate', payload: val });
    }
  }, [joined, sessionId]);

  const onOriginPlaceChanged = useCallback(() => {
    try {
      const place = originAutocomplete.current?.getPlace?.();
      const val = place?.formatted_address || place?.name || '';
      if (val && originInputRef.current) {
        originInputRef.current.value = val;
      }
    } catch (_) {}
    sendOriginUpdate();
  }, [sendOriginUpdate]);



  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    id: 'google-map-script',
    libraries: ['places'],
  });

  // Clean up BroadcastChannel on unmount or session change
  useEffect(() => {
    return () => {
      try { bcRef.current?.close?.(); } catch (_) {}
    };
  }, []);

  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {}
    );
  }, []);

  const calculateRoute = useCallback(async () => {
    if (!window.google) return;
    const origin = originInputRef.current?.value;
    const destination = destinationInputRef.current?.value;
    if (!origin || !destination) return;
    sendOriginUpdate();

    const directionsService = new google.maps.DirectionsService();
    const result = await directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    });
    setMyDirections(result);
    setLastRoute({ origin, destination });

    // Persist to localStorage
    if (sessionId) {
      const key = `foodie:session:${sessionId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({
        ...existing,
        lastRoute: { origin, destination },
        myPreferences,
        updatedAt: Date.now(),
      }));
    }

    // Broadcast to other tabs (same origin)
    if (joined && bcRef.current) {
      bcRef.current.postMessage({ type: 'routeUpdate', payload: { origin, destination } });
    }
  }, [joined, sessionId]);

  const clearRoute = useCallback(() => {
    setMyDirections(null);
    setPeerDirections(null);
    setSelectedPlace(null);
    if (sessionId) {
      const key = `foodie:session:${sessionId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({
        ...existing,
        lastRoute: { origin: '', destination: '' },
        updatedAt: Date.now(),
      }));
    }
    // Clear inputs
    if (originInputRef.current) originInputRef.current.value = '';
    if (destinationInputRef.current) destinationInputRef.current.value = '';

    // Broadcast route and restaurant clear so peer view updates
    if (joined && bcRef.current) {
      bcRef.current.postMessage({ type: 'routeClear' });
      bcRef.current.postMessage({ type: 'restaurantsUpdate', payload: [] });
    }
    setRestaurants([]);
  }, [joined, sessionId]);

  const joinSession = useCallback(() => {
    const id = sessionInputRef.current?.value?.trim();
    if (!id) return;
    setSessionId(id);
    setJoined(true);
    try { bcRef.current?.close?.(); } catch (_) {}
    bcRef.current = new BroadcastChannel(`foodie-${id}`);
    bcRef.current.onmessage = async (event) => {
      const msg = event?.data || {};
      if (msg.type === 'routeUpdate') {
        const { origin, destination } = msg.payload || {};
        if (!window.google || !origin || !destination) return;
        try {
          const directionsService = new google.maps.DirectionsService();
          const result = await directionsService.route({
            origin,
            destination,
            travelMode: google.maps.TravelMode.DRIVING,
          });
          setPeerDirections(result);
        } catch (_) {}
      }
      if (msg.type === 'routeClear') {
        setPeerDirections(null);
      }
      if (msg.type === 'preferencesUpdate') {
        setPeerPreferences(msg.payload || { cuisines: [], price: 'any', openNow: false });
      }
      if (msg.type === 'restaurantsUpdate') {
        setRestaurants(Array.isArray(msg.payload) ? msg.payload : []);
      }
      if (msg.type === 'originUpdate') {
        const txt = (msg.payload || '').toString();
        setPeerOriginText(txt);
        if (sessionId) {
          const key = `foodie:session:${sessionId}`;
          const existing = JSON.parse(localStorage.getItem(key) || '{}');
          localStorage.setItem(key, JSON.stringify({ ...existing, peerOriginText: txt, updatedAt: Date.now() }));
        }
      }
    };

    // Load persisted state for this session
    const key = `foodie:session:${id}`;
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    if (saved?.lastRoute?.origin && saved?.lastRoute?.destination) {
      originInputRef.current.value = saved.lastRoute.origin;
      destinationInputRef.current.value = saved.lastRoute.destination;
      // Rebuild my route for consistency
      (async () => {
        if (!window.google) return;
        try {
          const directionsService = new google.maps.DirectionsService();
          const result = await directionsService.route({
            origin: saved.lastRoute.origin,
            destination: saved.lastRoute.destination,
            travelMode: google.maps.TravelMode.DRIVING,
          });
          setMyDirections(result);
        } catch (_) {}
      })();
    }
    if (saved?.myPreferences) {
      setMyPreferences(saved.myPreferences);
    }
    if (Array.isArray(saved?.restaurants)) {
      setRestaurants(saved.restaurants);
    }
    if (saved?.peerOriginText) {
      setPeerOriginText(saved.peerOriginText);
    }

    // Proactively share current state so the other tab gets it even if they joined earlier
    try {
      bcRef.current.postMessage({ type: 'preferencesUpdate', payload: saved?.myPreferences || myPreferences });
      if (saved?.lastRoute?.origin && saved?.lastRoute?.destination) {
        bcRef.current.postMessage({ type: 'routeUpdate', payload: { origin: saved.lastRoute.origin, destination: saved.lastRoute.destination } });
      }
      const currentOrigin = originInputRef.current?.value?.trim();
      if (currentOrigin) {
        bcRef.current.postMessage({ type: 'originUpdate', payload: currentOrigin });
      }
    } catch (_) {}
  }, []);

  const updatePreferences = useCallback((next) => {
    setMyPreferences(next);
    if (sessionId) {
      const key = `foodie:session:${sessionId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({
        ...existing,
        myPreferences: next,
        updatedAt: Date.now(),
      }));
    }
    if (joined && bcRef.current) {
      bcRef.current.postMessage({ type: 'preferencesUpdate', payload: next });
    }
  }, [joined, sessionId]);

  const toggleCuisine = useCallback((name) => {
    const set = new Set(myPreferences.cuisines);
    if (set.has(name)) set.delete(name); else set.add(name);
    updatePreferences({ ...myPreferences, cuisines: Array.from(set) });
  }, [myPreferences, updatePreferences]);

  const setPrice = useCallback((price) => {
    updatePreferences({ ...myPreferences, price });
  }, [myPreferences, updatePreferences]);

  const setOpenNow = useCallback((open) => {
    updatePreferences({ ...myPreferences, openNow: open });
  }, [myPreferences, updatePreferences]);

  const getSearchLocation = useCallback(() => {
    const path = myDirections?.routes?.[0]?.overview_path;
    if (path && path.length) {
      const mid = path[Math.floor(path.length / 2)];
      return { lat: mid.lat(), lng: mid.lng() };
    }
    return center;
  }, [myDirections, center]);

  const findRestaurants = useCallback(() => {
    if (!window.google || !mapRef.current) return;
    sendOriginUpdate();

    // Require a start location (origin) for now
    const originText = originInputRef.current?.value?.trim();
    if (!originText) { alert('Please enter a start location first.'); return; }
    const peerText = (peerOriginText || '').trim();
    if (!peerText) { alert('Waiting for the other person\'s start location.'); return; }

    // Must have overlapping cuisines
    const norm = (arr) => (arr || []).map((s) => String(s).toLowerCase().trim());
    const mine = norm(myPreferences.cuisines);
    const peer = norm(peerPreferences.cuisines);

    let common = [];
    if (mine.length === 0 && peer.length === 0) {
      alert('No cuisines selected. Please choose at least one.');
      setRestaurants([]);
      return;
    } else if (mine.length === 0) {
      // Treat empty as "any" → use peer's
      common = peer;
    } else if (peer.length === 0) {
      // Treat empty as "any" → use mine
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
    const cuisine = common[0]; // use first common for now

    const geocode = (address) => new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (res, status) => {
        if (status === google.maps.GeocoderStatus.OK && res?.[0]) {
          const loc = res[0].geometry.location;
          resolve({ lat: loc.lat(), lng: loc.lng() });
        } else { reject(new Error('geocode failed')); }
      });
    });

    (async () => {
      try {
        const [a, b] = await Promise.all([geocode(originText), geocode(peerText)]);
        const mid = { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };

        const request = {
          location: new google.maps.LatLng(mid.lat, mid.lng),
          radius: 7000,
          type: 'restaurant',
          query: `${cuisine} restaurant`,
          openNow: myPreferences.openNow || undefined,
        };
        const priceIndex = { '$': 0, '$$': 1, '$$$': 2, '$$$$': 3 }[myPreferences.price];
        if (priceIndex !== undefined) { request.minPriceLevel = priceIndex; request.maxPriceLevel = priceIndex; }

        const haversineKm = (p, q) => {
          const toRad = (d) => (d * Math.PI) / 180;
          const R = 6371;
          const dLat = toRad(q.lat - p.lat);
          const dLng = toRad(q.lng - p.lng);
          const lat1 = toRad(p.lat);
          const lat2 = toRad(q.lat);
          const aH = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
          return 2 * R * Math.asin(Math.sqrt(aH));
        };

        const service = new google.maps.places.PlacesService(mapRef.current);
        service.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const kw = cuisine.toLowerCase();
            const filtered = results.filter((p) => {
              const name = (p.name || '').toLowerCase();
              const vicinity = (p.vicinity || p.formatted_address || '').toLowerCase();
              const types = (p.types || []).join('|').toLowerCase();
              return name.includes(kw) || vicinity.includes(kw) || types.includes(kw);
            });
            const serialized = filtered.map((p) => ({
              placeId: p.place_id,
              name: p.name,
              rating: p.rating,
              userRatingsTotal: p.user_ratings_total,
              address: p.vicinity || p.formatted_address || '',
              location: { lat: p.geometry?.location?.lat?.() ?? null, lng: p.geometry?.location?.lng?.() ?? null },
            })).filter((x) => x.location.lat != null && x.location.lng != null);

            // Add fairness sort: by sum of distances from both origins
            const withDistances = serialized.map((r) => {
              const d1 = haversineKm(a, r.location);
              const d2 = haversineKm(b, r.location);
              return { ...r, sumDistanceKm: d1 + d2 };
            }).sort((u, v) => u.sumDistanceKm - v.sumDistanceKm);

            setRestaurants(withDistances);

            if (sessionId) {
              const key = `foodie:session:${sessionId}`;
              const existing = JSON.parse(localStorage.getItem(key) || '{}');
              localStorage.setItem(key, JSON.stringify({ ...existing, restaurants: withDistances, updatedAt: Date.now() }));
            }
            if (joined && bcRef.current) {
              bcRef.current.postMessage({ type: 'restaurantsUpdate', payload: withDistances });
            }
            if (withDistances[0]) { mapRef.current?.panTo(withDistances[0].location); }
          } else {
            setRestaurants([]);
            if (sessionId) {
              const key = `foodie:session:${sessionId}`;
              const existing = JSON.parse(localStorage.getItem(key) || '{}');
              localStorage.setItem(key, JSON.stringify({ ...existing, restaurants: [], updatedAt: Date.now() }));
            }
            if (joined && bcRef.current) { bcRef.current.postMessage({ type: 'restaurantsUpdate', payload: [] }); }
          }
        });
      } catch (e) {
        alert('Could not geocode one or both start locations.');
      }
    })();
  }, [myPreferences, peerPreferences, peerOriginText, joined, sessionId]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 12,
          left: 12,
          background: 'white',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: 12,
          width: 'min(90vw, 420px)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 8,
            marginBottom: 8,
          }}>
            <div style={{ fontWeight: 600 }}>Preferences (You)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cuisineOptions.map((c) => (
                <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={myPreferences.cuisines.includes(c)}
                    onChange={() => toggleCuisine(c)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Price</span>
                <select
                  value={myPreferences.price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ border: '1px solid #ddd', borderRadius: 6, padding: '6px 8px' }}
                >
                  <option value="any">Any</option>
                  <option value="$">$</option>
                  <option value="$$">$$</option>
                  <option value="$$$">$$$</option>
                  <option value="$$$$">$$$$</option>
                </select>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={myPreferences.openNow}
                  onChange={(e) => setOpenNow(e.target.checked)}
                />
                <span>Open now</span>
              </label>
            </div>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Preferences (Peer)</div>
            <div style={{ fontSize: 12, color: '#374151' }}>
              Cuisines: {peerPreferences.cuisines?.join(', ') || '—'} | Price: {peerPreferences.price || 'any'} | Open now: {peerPreferences.openNow ? 'Yes' : 'No'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={sessionInputRef}
              placeholder="Enter session ID (same on both devices)"
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 6,
              }}
              defaultValue={sessionId}
            />
            <button
              onClick={joinSession}
              disabled={joined}
              style={{
                background: joined ? '#9ca3af' : '#111827',
                color: 'white',
                border: 0,
                borderRadius: 6,
                padding: '10px 12px',
                cursor: joined ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {joined ? 'Joined' : 'Join'}
            </button>
          </div>
          <Autocomplete onLoad={(ac) => (originAutocomplete.current = ac)} onPlaceChanged={onOriginPlaceChanged}>
            <input
              ref={originInputRef}
              placeholder="Enter start location"
              onChange={sendOriginUpdate}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 6,
              }}
            />
          </Autocomplete>
          <Autocomplete onLoad={(ac) => (destinationAutocomplete.current = ac)}>
            <input
              ref={destinationInputRef}
              placeholder="Enter destination"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 6,
              }}
            />
          </Autocomplete>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={calculateRoute}
              style={{
                background: '#111827',
                color: 'white',
                border: 0,
                borderRadius: 6,
                padding: '10px 12px',
                cursor: 'pointer',
              }}
            >
              Route
            </button>
            <button
              onClick={sendOriginUpdate}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 0,
                borderRadius: 6,
                padding: '10px 12px',
                cursor: 'pointer',
              }}
            >
              Share Start
            </button>
            <button
              onClick={clearRoute}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 0,
                borderRadius: 6,
                padding: '10px 12px',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
            <button
              onClick={findRestaurants}
              style={{
                background: '#10b981',
                color: 'white',
                border: 0,
                borderRadius: 6,
                padding: '10px 12px',
                cursor: 'pointer',
              }}
            >
              Find Restaurants (Common)
            </button>
          </div>
        </div>
      </div>

      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} onLoad={(m) => { mapRef.current = m; }}>
        {myDirections && (
          <DirectionsRenderer
            directions={myDirections}
            options={{ polylineOptions: { strokeColor: '#2563eb', strokeWeight: 5 } }}
          />
        )}
        {peerDirections && (
          <DirectionsRenderer
            directions={peerDirections}
            options={{ polylineOptions: { strokeColor: '#ef4444', strokeWeight: 5 } }}
          />
        )}

        {restaurants.map((r) => (
          <MarkerF
            key={r.placeId}
            position={r.location}
            onClick={() => setSelectedPlace(r)}
          />
        ))}

        {selectedPlace && (
          <InfoWindow
            position={selectedPlace.location}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div style={{ maxWidth: 240 }}>
              <div style={{ fontWeight: 600 }}>{selectedPlace.name}</div>
              <div>Rating: {selectedPlace.rating ?? 'N/A'} ({selectedPlace.userRatingsTotal ?? 0})</div>
              <div style={{ fontSize: 12, color: '#374151' }}>{selectedPlace.address || ''}</div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      <div style={{
        marginTop: 12,
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: 12,
        maxHeight: '30vh',
        overflowY: 'auto'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Overlapped Restaurants</div>
        {restaurants.length === 0 ? (
          <div style={{ color: '#6b7280', fontSize: 14 }}>No results</div>
        ) : (
          <ul style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
            {restaurants.map((r) => (
              <li key={r.placeId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#374151' }}>{r.address}</div>
                  <div style={{ fontSize: 12 }}>Rating: {r.rating ?? 'N/A'} ({r.userRatingsTotal ?? 0})</div>
                </div>
                <button
                  onClick={() => { setSelectedPlace(r); mapRef.current?.panTo(r.location); }}
                  style={{ background: '#111827', color: 'white', border: 0, borderRadius: 6, padding: '8px 10px', cursor: 'pointer' }}
                >
                  Show
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

