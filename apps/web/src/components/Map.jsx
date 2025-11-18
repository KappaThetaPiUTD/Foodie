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

export default function Map({ openPanel, onClosePanel }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      {/* Always Visible: Location Controls and Find Button */}
      <div
        className="card"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '16px'
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          {/* Location Section */}
          <div style={{ flex: 1 }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              Your Location
            </h4>

            <Autocomplete
              onLoad={(ac) => (originAutocomplete.current = ac)}
              onPlaceChanged={handleOnOriginPlaceChanged}
            >
              <input
                ref={originInputRef}
                placeholder="Enter your starting location"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </Autocomplete>
          </div>

          {/* Find Restaurants Button */}
          <div>
            <button
              onClick={handleFindRestaurants}
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
            >
              Find Restaurants
            </button>
          </div>
        </div>
      </div>

      {/* Map and Results Layout */}
      <div style={{ display: 'flex', gap: '16px', height: '70vh', position: 'relative' }}>
        {/* Sliding Preferences Panel */}
        {openPanel === 'preferences' && (
          <>
            {/* Backdrop */}
            <div
              onClick={onClosePanel}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 40,
                animation: 'fadeIn 0.2s ease-out'
              }}
            />
            {/* Panel */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '450px',
                maxWidth: '90vw',
                backgroundColor: 'white',
                boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
                zIndex: 50,
                overflowY: 'auto',
                animation: 'slideInRight 0.3s ease-out'
              }}
            >
              <div style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                    Your Preferences
                  </h3>
                  <button
                    onClick={onClosePanel}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '28px',
                      cursor: 'pointer',
                      color: '#6b7280',
                      padding: '4px',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>

                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px', lineHeight: 1.6 }}>
                  Customize your dining preferences to help us find the perfect restaurants for you and your group.
                </p>

                {/* Cuisine Selection */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                      Favorite Cuisines
                    </h4>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                    Select all cuisines you'd like to explore
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {cuisineOptions.map((cuisine) => {
                      const isSelected = myPreferences.cuisines.includes(cuisine);
                      return (
                        <label
                          key={cuisine}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? '#dcfce7' : '#f9fafb',
                            border: '2px solid',
                            borderColor: isSelected ? '#16a34a' : '#e5e7eb',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            userSelect: 'none'
                          }}
                          onMouseOver={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                              e.currentTarget.style.borderColor = '#d1d5db';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleCuisine(cuisine)}
                            style={{
                              width: '18px',
                              height: '18px',
                              margin: 0,
                              cursor: 'pointer',
                              accentColor: '#16a34a'
                            }}
                          />
                          <span>{cuisine}</span>
                        </label>
                      );
                    })}
                  </div>
                  {myPreferences.cuisines.length > 0 && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#166534'
                    }}>
                      ✓ {myPreferences.cuisines.length} cuisine{myPreferences.cuisines.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>

                {/* Price Range */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                      Price Range
                    </h4>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                    Choose your preferred dining budget
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { value: 'any', label: 'Any Price', icon: '' },
                      { value: '$', label: 'Inexpensive', icon: '$' },
                      { value: '$$', label: 'Moderate', icon: '$$' },
                      { value: '$$$', label: 'Expensive', icon: '$$$' },
                      { value: '$$$$', label: 'Very Expensive', icon: '$$$$' }
                    ].map((option) => {
                      const isSelected = myPreferences.price === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSetPrice(option.value)}
                          style={{
                            padding: '12px 16px',
                            fontSize: '14px',
                            fontWeight: '600',
                            backgroundColor: isSelected ? '#dcfce7' : '#f9fafb',
                            color: isSelected ? '#166534' : '#374151',
                            border: '2px solid',
                            borderColor: isSelected ? '#16a34a' : '#e5e7eb',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'left',
                            gridColumn: option.value === 'any' ? 'span 2' : 'span 1'
                          }}
                          onMouseOver={(e) => {
                            if (!isSelected) {
                              e.target.style.backgroundColor = '#f3f4f6';
                              e.target.style.borderColor = '#d1d5db';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isSelected) {
                              e.target.style.backgroundColor = '#f9fafb';
                              e.target.style.borderColor = '#e5e7eb';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>{option.icon}</span>
                            <span>{option.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Open Now */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                      Availability
                    </h4>
                  </div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: '16px',
                    backgroundColor: myPreferences.openNow ? '#dcfce7' : '#f9fafb',
                    border: '2px solid',
                    borderColor: myPreferences.openNow ? '#16a34a' : '#e5e7eb',
                    borderRadius: '10px',
                    transition: 'all 0.2s',
                    userSelect: 'none'
                  }}
                  onMouseOver={(e) => {
                    if (!myPreferences.openNow) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!myPreferences.openNow) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}>
                    <input
                      type="checkbox"
                      checked={myPreferences.openNow}
                      onChange={(e) => handleSetOpenNow(e.target.checked)}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: '#16a34a'
                      }}
                    />
                    <div>
                      <div style={{ color: '#0f172a', fontWeight: '600' }}>
                        Only show restaurants open now
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '400', marginTop: '2px' }}>
                        Filter out closed restaurants
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sliding Session Panel */}
        {openPanel === 'session' && (
          <>
            {/* Backdrop */}
            <div
              onClick={onClosePanel}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 40,
                animation: 'fadeIn 0.2s ease-out'
              }}
            />
            {/* Panel */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '450px',
                maxWidth: '90vw',
                backgroundColor: 'white',
                boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
                zIndex: 50,
                overflowY: 'auto',
                animation: 'slideInRight 0.3s ease-out'
              }}
            >
              <div style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                    Session
                  </h3>
                  <button
                    onClick={onClosePanel}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '28px',
                      cursor: 'pointer',
                      color: '#6b7280',
                      padding: '4px',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>

                {!joined ? (
                  <>
                    {/* Create New Session */}
                    <div style={{ marginBottom: '32px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>
                        Create New Session
                      </h4>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', lineHeight: 1.5 }}>
                        Start a new collaborative session and invite friends to join
                      </p>
                      <button
                        onClick={() => {
                          const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                          sessionInputRef.current.value = code;
                          handleJoinSession();
                        }}
                        style={{
                          width: '100%',
                          padding: '14px 20px',
                          fontSize: '15px',
                          fontWeight: '600',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 8px rgba(22, 163, 74, 0.2)'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#15803d';
                          e.target.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#16a34a';
                          e.target.style.boxShadow = '0 2px 8px rgba(22, 163, 74, 0.2)';
                        }}
                      >
                        Create Session Code
                      </button>
                    </div>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                      <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
                      <span style={{ padding: '0 16px', fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>OR</span>
                      <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
                    </div>

                    {/* Join Existing Session */}
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>
                        Join Existing Session
                      </h4>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', lineHeight: 1.5 }}>
                        Enter a session code shared by a friend
                      </p>
                      <input
                        ref={sessionInputRef}
                        placeholder="Enter session code (e.g., ABC123)"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          fontSize: '15px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '10px',
                          marginBottom: '12px',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                          fontFamily: 'monospace',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                      <button
                        onClick={handleJoinSession}
                        style={{
                          width: '100%',
                          padding: '14px 20px',
                          fontSize: '15px',
                          fontWeight: '600',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          border: '2px solid #e5e7eb',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#e5e7eb';
                          e.target.style.borderColor = '#d1d5db';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6';
                          e.target.style.borderColor = '#e5e7eb';
                        }}
                      >
                        Join Session
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Connected State */}
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#dcfce7',
                      border: '2px solid #16a34a',
                      borderRadius: '12px',
                      marginBottom: '24px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#16a34a',
                          borderRadius: '50%',
                          animation: 'pulse 2s ease-in-out infinite'
                        }} />
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#166534' }}>
                          Session Active
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#15803d', margin: 0 }}>
                        You're connected and sharing preferences in real-time
                      </p>
                    </div>

                    {/* Session Code Display */}
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                        Session Code
                      </h4>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          flex: 1,
                          padding: '12px 16px',
                          backgroundColor: '#f9fafb',
                          border: '2px solid #e5e7eb',
                          borderRadius: '10px',
                          fontFamily: 'monospace',
                          fontSize: '18px',
                          fontWeight: '700',
                          letterSpacing: '2px',
                          textAlign: 'center',
                          color: '#0f172a'
                        }}>
                          {sessionInputRef.current?.value || 'N/A'}
                        </div>
                        <button
                          onClick={() => {
                            const code = sessionInputRef.current?.value;
                            if (code) {
                              navigator.clipboard.writeText(code);
                              alert('Session code copied to clipboard!');
                            }
                          }}
                          style={{
                            padding: '12px 16px',
                            backgroundColor: '#f3f4f6',
                            border: '2px solid #e5e7eb',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#e5e7eb';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#f3f4f6';
                          }}
                          title="Copy to clipboard"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            const code = sessionInputRef.current?.value;
                            if (code && navigator.share) {
                              navigator.share({
                                title: 'FoodieMaps Session',
                                text: `Join my FoodieMaps session with code: ${code}`,
                                url: window.location.href
                              }).catch(() => {});
                            } else {
                              alert(`Share this code with friends: ${code}`);
                            }
                          }}
                          style={{
                            padding: '12px 16px',
                            backgroundColor: '#f3f4f6',
                            border: '2px solid #e5e7eb',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#e5e7eb';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#f3f4f6';
                          }}
                          title="Share session"
                        >
                          Share
                        </button>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px', marginBottom: 0 }}>
                        Share this code with friends to collaborate
                      </p>
                    </div>

                    {/* Clear Session */}
                    <button
                      onClick={() => {
                        if (confirm('Leave this session? All session data will be cleared.')) {
                          const sessionKeys = Object.keys(localStorage).filter(key =>
                            key.startsWith('foodie:session:')
                          );
                          sessionKeys.forEach(key => localStorage.removeItem(key));
                          window.location.reload();
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '2px solid #fee2e2',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#fee2e2';
                        e.target.style.borderColor = '#fecaca';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#fef2f2';
                        e.target.style.borderColor = '#fee2e2';
                      }}
                    >
                      Leave Session
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}

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

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}