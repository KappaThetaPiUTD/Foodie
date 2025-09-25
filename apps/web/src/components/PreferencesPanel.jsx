import { cuisineOptions } from '../hooks/usePreferences';

export default function PreferencesPanel({
  myPreferences,
  peerPreferences,
  onToggleCuisine,
  onSetPrice,
  onSetOpenNow
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* My Preferences */}
      <div>
        <h4 style={{ 
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--gray-900)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          👤 Your Preferences
        </h4>
        
        {/* Cuisine Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--gray-700)',
            marginBottom: '8px'
          }}>
            🍽️ Cuisine Types
          </label>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '8px'
          }}>
            {cuisineOptions.map((cuisine) => (
              <label 
                key={cuisine} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: myPreferences.cuisines.includes(cuisine) 
                    ? 'var(--primary-50)' 
                    : 'var(--gray-50)',
                  border: '1px solid',
                  borderColor: myPreferences.cuisines.includes(cuisine) 
                    ? 'var(--primary-500)' 
                    : 'var(--gray-200)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  fontSize: '13px'
                }}
              >
                <input
                  type="checkbox"
                  checked={myPreferences.cuisines.includes(cuisine)}
                  onChange={() => onToggleCuisine(cuisine)}
                  className="checkbox"
                  style={{ margin: 0 }}
                />
                <span style={{ 
                  color: myPreferences.cuisines.includes(cuisine) 
                    ? 'var(--primary-700)' 
                    : 'var(--gray-700)',
                  fontWeight: myPreferences.cuisines.includes(cuisine) ? '500' : '400'
                }}>
                  {cuisine}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price and Open Now Controls */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '12px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ 
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--gray-700)',
              marginBottom: '6px'
            }}>
              💰 Price Range
            </label>
            <select
              value={myPreferences.price}
              onChange={(e) => onSetPrice(e.target.value)}
              className="select"
              style={{ width: '100%' }}
            >
              <option value="any">Any Price</option>
              <option value="$">$ Budget</option>
              <option value="$$">$$ Moderate</option>
              <option value="$$$">$$$ Expensive</option>
              <option value="$$$$">$$$$ Fine Dining</option>
            </select>
          </div>
          
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: myPreferences.openNow ? 'var(--success-50)' : 'var(--gray-50)',
            border: '1px solid',
            borderColor: myPreferences.openNow ? 'var(--success-500)' : 'var(--gray-200)',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            <input
              type="checkbox"
              checked={myPreferences.openNow}
              onChange={(e) => onSetOpenNow(e.target.checked)}
              className="checkbox"
              style={{ margin: 0 }}
            />
            <span style={{ 
              color: myPreferences.openNow ? 'var(--success-700)' : 'var(--gray-700)',
              fontWeight: '500'
            }}>
              🕐 Open Now
            </span>
          </label>
        </div>
      </div>

      {/* Peer Preferences Display */}
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--gray-50)',
        borderRadius: '8px',
        border: '1px solid var(--gray-200)'
      }}>
        <h4 style={{ 
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--gray-900)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          👥 Friend's Preferences
        </h4>
        
        {peerPreferences.cuisines.length > 0 ? (
          <div style={{ fontSize: '14px', color: 'var(--gray-700)', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: 'var(--gray-900)' }}>🍽️ Cuisines:</strong>{' '}
              <span style={{ 
                padding: '2px 8px',
                backgroundColor: 'var(--primary-100)',
                borderRadius: '12px',
                fontSize: '12px',
                color: 'var(--primary-700)'
              }}>
                {peerPreferences.cuisines.join(', ')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>
                <strong style={{ color: 'var(--gray-900)' }}>💰 Price:</strong>{' '}
                {peerPreferences.price === 'any' ? 'Any' : peerPreferences.price}
              </span>
              <span>
                <strong style={{ color: 'var(--gray-900)' }}>🕐 Open Now:</strong>{' '}
                <span style={{ 
                  color: peerPreferences.openNow ? 'var(--success-600)' : 'var(--gray-500)'
                }}>
                  {peerPreferences.openNow ? 'Yes' : 'No'}
                </span>
              </span>
            </div>
          </div>
        ) : (
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--gray-500)',
            fontStyle: 'italic',
            margin: 0
          }}>
            ⏳ Waiting for friend's preferences...
          </p>
        )}
      </div>
    </div>
  );
}
