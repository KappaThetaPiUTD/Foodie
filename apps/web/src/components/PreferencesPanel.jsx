import { cuisineOptions } from '../hooks/usePreferences';

export default function PreferencesPanel({
  myPreferences,
  peerPreferences,
  onToggleCuisine,
  onSetPrice,
  onSetOpenNow
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 8,
      marginBottom: 8,
    }}>
      {/* My Preferences */}
      <div style={{ fontWeight: 600 }}>Preferences (You)</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {cuisineOptions.map((cuisine) => (
          <label key={cuisine} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={myPreferences.cuisines.includes(cuisine)}
              onChange={() => onToggleCuisine(cuisine)}
            />
            <span>{cuisine}</span>
          </label>
        ))}
      </div>

      {/* Price and Open Now Controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Price</span>
          <select
            value={myPreferences.price}
            onChange={(e) => onSetPrice(e.target.value)}
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
            onChange={(e) => onSetOpenNow(e.target.checked)}
          />
          <span>Open now</span>
        </label>
      </div>

      {/* Peer Preferences Display */}
      <div style={{ fontWeight: 600, marginTop: 8 }}>Preferences (Peer)</div>
      <div style={{ fontSize: 12, color: '#374151' }}>
        {peerPreferences.cuisines.length > 0 ? (
          <>
            <strong>Cuisines:</strong> {peerPreferences.cuisines.join(', ')}
            <br />
            <strong>Price:</strong> {peerPreferences.price} | 
            <strong> Open now:</strong> {peerPreferences.openNow ? 'Yes' : 'No'}
          </>
        ) : (
          'Waiting for peer preferences...'
        )}
      </div>
    </div>
  );
}
