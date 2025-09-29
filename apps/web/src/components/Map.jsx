import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

// Define libraries outside component to prevent reloading
const libraries = ['places'];

// Components
import LobbyManager from './LobbyManager';
import PreferencesPanel from './PreferencesPanel';
import LocationControls from './LocationControls';
import MapView from './MapView';
import RestaurantList from './RestaurantList';

// Hooks
import { useSession } from '../hooks/useSession';
import { usePreferences, cuisineOptions } from '../hooks/usePreferences';
import { useRouting } from '../hooks/useRouting';
import { useRestaurants } from '../hooks/useRestaurants';

export default function Map() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
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

  if (!isLoaded) return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      gap: '16px'
    }}>
      <div className="spinner"></div>
      <p style={{ 
        color: 'var(--gray-600)',
        fontSize: '16px',
        fontWeight: '500'
      }}>
        Loading FoodieMaps...
      </p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        {/* Main Controls Panel - Horizontal */}
        <div
          className="card"
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="card-body" style={{ padding: '16px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr', 
              gap: '20px',
              alignItems: 'start'
            }}>
              {/* Preferences Section */}
              <div>
                <h4 style={{ 
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--gray-900)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  👤 Your Preferences
                </h4>
                
                {/* Compact Cuisine Selection */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px'
                  }}>
                    {cuisineOptions.map((cuisine) => (
                      <label 
                        key={cuisine} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: myPreferences.cuisines.includes(cuisine) 
                            ? 'var(--primary-100)' 
                            : 'var(--gray-100)',
                          border: '1px solid',
                          borderColor: myPreferences.cuisines.includes(cuisine) 
                            ? 'var(--primary-400)' 
                            : 'var(--gray-300)',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={myPreferences.cuisines.includes(cuisine)}
                          onChange={() => handleToggleCuisine(cuisine)}
                          style={{ 
                            width: '12px', 
                            height: '12px',
                            margin: 0
                          }}
                        />
                        <span>{cuisine}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price and Open Now */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={myPreferences.price}
                    onChange={(e) => handleSetPrice(e.target.value)}
                    style={{ 
                      padding: '4px 6px',
                      fontSize: '12px',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '4px',
                      flex: 1
                    }}
                  >
                    <option value="any">Any</option>
                    <option value="$">$</option>
                    <option value="$$">$$</option>
                    <option value="$$$">$$$</option>
                    <option value="$$$$">$$$$</option>
                  </select>
                  
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap'
                  }}>
                    <input
                      type="checkbox"
                      checked={myPreferences.openNow}
                      onChange={(e) => handleSetOpenNow(e.target.checked)}
                      style={{ width: '12px', height: '12px' }}
                    />
                    Open Now
                  </label>
                </div>
              </div>

              {/* Location Section */}
              <div>
                <h4 style={{ 
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--gray-900)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📍 Locations
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Autocomplete 
                    onLoad={(ac) => (originAutocomplete.current = ac)}
                    onPlaceChanged={handleOnOriginPlaceChanged}
                  >
                    <input
                      ref={originInputRef}
                      placeholder="Starting location"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '12px',
                        border: '1px solid var(--gray-300)',
                        borderRadius: '4px'
                      }}
                    />
                  </Autocomplete>

                  <Autocomplete onLoad={(ac) => (destinationAutocomplete.current = ac)}>
                    <input
                      ref={destinationInputRef}
                      placeholder="Destination (optional)"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '12px',
                        border: '1px solid var(--gray-300)',
                        borderRadius: '4px'
                      }}
                    />
                  </Autocomplete>
                </div>
              </div>

              {/* Actions Section */}
              <div>
                <h4 style={{ 
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--gray-900)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🎯 Actions
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={handleCalculateRoute}
                      style={{
                        padding: '6px 8px',
                        fontSize: '11px',
                        backgroundColor: 'var(--gray-100)',
                        border: '1px solid var(--gray-300)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      🗺️ Route
                    </button>
                    
                    <button
                      onClick={handleSendOriginUpdate}
                      style={{
                        padding: '6px 8px',
                        fontSize: '11px',
                        backgroundColor: 'var(--primary-100)',
                        border: '1px solid var(--primary-300)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      📤 Share
                    </button>
                    
                    <button
                      onClick={handleClearRoute}
                      style={{
                        padding: '6px 8px',
                        fontSize: '11px',
                        backgroundColor: 'var(--error-100)',
                        border: '1px solid var(--error-300)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <button
                    onClick={handleFindRestaurants}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: 'var(--success-500)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🔍 Find Restaurants
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lobby Management - Compact */}
        <LobbyManager
          sessionInputRef={sessionInputRef}
          onJoinSession={handleJoinSession}
          joined={joined}
        />
      </div>

      {/* Map and Results Layout */}
      <div style={{ display: 'flex', gap: '16px', height: '70vh' }}>
        {/* Map View */}
        <div style={{ flex: 2 }}>
          <MapView
            center={center}
            myDirections={myDirections}
            peerDirections={peerDirections}
            restaurants={restaurants}
            onMapLoad={handleMapLoad}
          />
        </div>

        {/* Restaurant List */}
        <div style={{ flex: 1 }}>
          <RestaurantList restaurants={restaurants} />
        </div>
      </div>
    </div>
  );
}