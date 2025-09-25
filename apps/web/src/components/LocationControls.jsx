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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Origin Input */}
      <Autocomplete 
        onLoad={(ac) => (originAutocomplete.current = ac)}
        onPlaceChanged={onOriginPlaceChanged}
      >
        <input
          ref={originInputRef}
          placeholder="Enter origin"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: 6,
          }}
        />
      </Autocomplete>

      {/* Destination Input */}
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

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={onCalculateRoute}
          style={{
            background: '#111827',
            color: 'white',
            border: 0,
            borderRadius: 6,
            padding: '10px 12px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Route
        </button>
        
        <button
          onClick={onShareStart}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 0,
            borderRadius: 6,
            padding: '10px 12px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Share Start
        </button>
        
        <button
          onClick={onClearRoute}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 0,
            borderRadius: 6,
            padding: '10px 12px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Clear
        </button>
        
        <button
          onClick={onFindRestaurants}
          style={{
            background: '#10b981',
            color: 'white',
            border: 0,
            borderRadius: 6,
            padding: '10px 12px',
            cursor: 'pointer',
            fontWeight: 500,
            flex: 1
          }}
        >
          Find Restaurants
        </button>
      </div>
    </div>
  );
}
