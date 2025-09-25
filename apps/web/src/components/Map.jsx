import { useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

// Components
import LobbyManager from './LobbyManager';
import PreferencesPanel from './PreferencesPanel';
import LocationControls from './LocationControls';
import MapView from './MapView';
import RestaurantList from './RestaurantList';

// Hooks
import { useSession } from '../hooks/useSession';
import { usePreferences } from '../hooks/usePreferences';
import { useRouting } from '../hooks/useRouting';
import { useRestaurants } from '../hooks/useRestaurants';

export default function Map() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });
  const [center, setCenter] = useState({ lat: 32.8998, lng: -97.0403 });
  const [mapRef, setMapRef] = useState(null);

  // Session management
  const { sessionId, joined, sessionInputRef, joinSession, broadcastMessage, saveToSession } = useSession();

  // Preferences management
  const {
    myPreferences,
    peerPreferences,
    setPeerPreferences,
    toggleCuisine,
    setPrice,
    setOpenNow,
    loadPreferences
  } = usePreferences();

  // Routing management
  const {
    originAutocomplete,
    destinationAutocomplete,
    originInputRef,
    destinationInputRef,
    myDirections,
    peerDirections,
    peerOriginText,
    setPeerOriginText,
    sendOriginUpdate,
    onOriginPlaceChanged,
    calculateRoute,
    clearRoute,
    loadRoute,
    handlePeerRouteUpdate,
    setPeerDirections
  } = useRouting();

  // Restaurant management
  const { restaurants, setRestaurants, findRestaurants } = useRestaurants();

  // Get user's current location on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // Keep default DFW location if geolocation fails
      }
    );
  }, []);

  // Handle session join and message routing
  const handleJoinSession = () => {
    const savedData = joinSession(handleBroadcastMessage);
    
    // Load saved preferences
    loadPreferences(savedData);
    
    // Load saved route
    if (savedData?.lastRoute) {
      loadRoute(savedData.lastRoute);
    }
    
    // Load saved restaurants
    if (savedData?.restaurants) {
      setRestaurants(savedData.restaurants);
    }
    
    // Load peer origin text
    if (savedData?.peerOriginText) {
      setPeerOriginText(savedData.peerOriginText);
    }
  };

  // Handle broadcast messages from other tabs
  const handleBroadcastMessage = async (event) => {
    const msg = event?.data || {};
    
    switch (msg.type) {
      case 'routeUpdate':
        const { origin, destination } = msg.payload || {};
        await handlePeerRouteUpdate(origin, destination);
        break;
        
      case 'routeClear':
        setPeerDirections(null);
        break;
        
      case 'preferencesUpdate':
        setPeerPreferences(msg.payload || { cuisines: [], price: 'any', openNow: false });
        break;
        
      case 'restaurantsUpdate':
        setRestaurants(Array.isArray(msg.payload) ? msg.payload : []);
        break;
        
      case 'originUpdate':
        const txt = (msg.payload || '').toString();
        setPeerOriginText(txt);
        saveToSession({ peerOriginText: txt });
        break;
    }
  };

  // Wrapper functions that include broadcast and save functionality
  const handleToggleCuisine = (cuisine) => {
    toggleCuisine(cuisine, broadcastMessage, saveToSession);
  };

  const handleSetPrice = (price) => {
    setPrice(price, broadcastMessage, saveToSession);
  };

  const handleSetOpenNow = (openNow) => {
    setOpenNow(openNow, broadcastMessage, saveToSession);
  };

  const handleCalculateRoute = () => {
    calculateRoute(broadcastMessage, saveToSession, myPreferences);
  };

  const handleSendOriginUpdate = () => {
    sendOriginUpdate(broadcastMessage, saveToSession);
  };

  const handleOnOriginPlaceChanged = () => {
    onOriginPlaceChanged(broadcastMessage, saveToSession);
  };

  const handleClearRoute = () => {
    clearRoute(broadcastMessage, saveToSession);
    setRestaurants([]);
  };

  const handleFindRestaurants = () => {
    findRestaurants(
      myPreferences,
      peerPreferences,
      peerOriginText,
      originInputRef,
      { current: mapRef },
      broadcastMessage,
      saveToSession,
      handleSendOriginUpdate
    );
  };

  const handleMapLoad = (map) => {
    setMapRef(map);
  };

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ position: 'relative' }}>
      {/* Lobby Management */}
      <LobbyManager
        sessionInputRef={sessionInputRef}
        onJoinSession={handleJoinSession}
        joined={joined}
      />

      {/* Main Controls Panel */}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Preferences Panel */}
          <PreferencesPanel
            myPreferences={myPreferences}
            peerPreferences={peerPreferences}
            onToggleCuisine={handleToggleCuisine}
            onSetPrice={handleSetPrice}
            onSetOpenNow={handleSetOpenNow}
          />

          {/* Location Controls */}
          <LocationControls
            originAutocomplete={originAutocomplete}
            destinationAutocomplete={destinationAutocomplete}
            originInputRef={originInputRef}
            destinationInputRef={destinationInputRef}
            onOriginPlaceChanged={handleOnOriginPlaceChanged}
            onCalculateRoute={handleCalculateRoute}
            onShareStart={handleSendOriginUpdate}
            onClearRoute={handleClearRoute}
            onFindRestaurants={handleFindRestaurants}
          />
        </div>
      </div>

      {/* Map View */}
      <MapView
        center={center}
        myDirections={myDirections}
        peerDirections={peerDirections}
        restaurants={restaurants}
        onMapLoad={handleMapLoad}
      />

      {/* Restaurant List */}
      <RestaurantList restaurants={restaurants} />
    </div>
  );
}