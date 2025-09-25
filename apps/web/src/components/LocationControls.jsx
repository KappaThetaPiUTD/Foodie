import { Autocomplete } from '@react-google-maps/api';

export default function LocationControls({
  originAutocomplete,
  destinationAutocomplete,
  originInputRef,
  destinationInputRef,
  onOriginPlaceChanged,
  onCalculateRoute,
  onShareStart,
  onClearRoute,
  onFindRestaurants
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h4 style={{ 
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--gray-900)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📍 Locations & Routes
        </h4>

        {/* Location Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ 
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--gray-700)',
              marginBottom: '6px'
            }}>
              🏠 Starting Location
            </label>
            <Autocomplete 
              onLoad={(ac) => (originAutocomplete.current = ac)}
              onPlaceChanged={onOriginPlaceChanged}
            >
              <input
                ref={originInputRef}
                placeholder="Enter your starting point (e.g. Dallas, TX)"
                className="input"
              />
            </Autocomplete>
          </div>

          <div>
            <label style={{ 
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--gray-700)',
              marginBottom: '6px'
            }}>
              🎯 Destination (Optional)
            </label>
            <Autocomplete onLoad={(ac) => (destinationAutocomplete.current = ac)}>
              <input
                ref={destinationInputRef}
                placeholder="Enter destination for route planning"
                className="input"
              />
            </Autocomplete>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '8px'
        }}>
          <button
            onClick={onCalculateRoute}
            className="btn btn-secondary"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>🗺️</span>
            Route
          </button>
          
          <button
            onClick={onShareStart}
            className="btn btn-primary"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>📤</span>
            Share Start
          </button>
          
          <button
            onClick={onClearRoute}
            className="btn btn-error"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>🗑️</span>
            Clear
          </button>
        </div>

        {/* Main Action Button */}
        <button
          onClick={onFindRestaurants}
          className="btn btn-success"
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>🔍</span>
          Find Perfect Restaurants
        </button>
      </div>
    </div>
  );
}
