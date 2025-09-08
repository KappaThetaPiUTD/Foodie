import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

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
  const socketRef = useRef(null);

  const [center, setCenter] = useState({ lat: 32.8998, lng: -97.0403 });
  const [myDirections, setMyDirections] = useState(null);
  const [peerDirections, setPeerDirections] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [joined, setJoined] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    id: 'google-map-script',
    libraries: ['places'],
  });

  // Connect to socket.io server once
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(url, { transports: ['websocket'] });

    // Receive peer route updates
    socketRef.current.on('routeUpdate', async ({ origin, destination }) => {
      if (!window.google) return;
      try {
        const directionsService = new google.maps.DirectionsService();
        const result = await directionsService.route({
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        });
        setPeerDirections(result);
      } catch (_) {
        // ignore
      }
    });

    socketRef.current.on('routeClear', () => {
      setPeerDirections(null);
    });

    return () => {
      socketRef.current?.disconnect?.();
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

    const directionsService = new google.maps.DirectionsService();
    const result = await directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    });
    setMyDirections(result);

    if (joined && sessionId && socketRef.current) {
      socketRef.current.emit('routeUpdate', { sessionId, origin, destination });
    }
  }, [joined, sessionId]);

  const clearRoute = useCallback(() => {
    setMyDirections(null);
    if (joined && sessionId && socketRef.current) {
      socketRef.current.emit('routeClear', { sessionId });
    }
  }, [joined, sessionId]);

  const joinSession = useCallback(() => {
    const id = sessionInputRef.current?.value?.trim();
    if (!id) return;
    setSessionId(id);
    socketRef.current?.emit('joinSession', id);
    setJoined(true);
  }, []);

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
          <Autocomplete onLoad={(ac) => (originAutocomplete.current = ac)}>
            <input
              ref={originInputRef}
              placeholder="Enter start location"
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
          </div>
        </div>
      </div>

      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
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
      </GoogleMap>
    </div>
  );
}

