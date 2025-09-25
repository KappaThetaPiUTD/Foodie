import { GoogleMap, DirectionsRenderer, MarkerF, InfoWindow } from '@react-google-maps/api';
import { useState, useRef } from 'react';

const containerStyle = {
  width: '100%',
  height: '60vh',
  borderRadius: 12,
  overflow: 'hidden',
};

export default function MapView({
  center,
  myDirections,
  peerDirections,
  restaurants,
  onMapLoad
}) {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const mapRef = useRef(null);

  const handleMapLoad = (map) => {
    mapRef.current = map;
    if (onMapLoad) {
      onMapLoad(map);
    }
  };

  return (
    <GoogleMap 
      mapContainerStyle={containerStyle} 
      center={center} 
      zoom={12} 
      onLoad={handleMapLoad}
    >
      {/* My route (blue) */}
      {myDirections && (
        <DirectionsRenderer
          directions={myDirections}
          options={{ 
            polylineOptions: { 
              strokeColor: '#2563eb', 
              strokeWeight: 5 
            } 
          }}
        />
      )}

      {/* Peer route (red) */}
      {peerDirections && (
        <DirectionsRenderer
          directions={peerDirections}
          options={{ 
            polylineOptions: { 
              strokeColor: '#ef4444', 
              strokeWeight: 5 
            } 
          }}
        />
      )}

      {/* Restaurant markers */}
      {restaurants.map((restaurant) => (
        <MarkerF
          key={restaurant.placeId}
          position={restaurant.location}
          onClick={() => setSelectedPlace(restaurant)}
        />
      ))}

      {/* Restaurant info window */}
      {selectedPlace && (
        <InfoWindow
          position={selectedPlace.location}
          onCloseClick={() => setSelectedPlace(null)}
        >
          <div style={{ maxWidth: 240 }}>
            <div style={{ fontWeight: 600 }}>{selectedPlace.name}</div>
            <div>
              Rating: {selectedPlace.rating ?? 'N/A'} ({selectedPlace.userRatingsTotal ?? 0})
            </div>
            <div style={{ fontSize: 12, color: '#374151' }}>
              {selectedPlace.address || ''}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
