export default function RestaurantList({ restaurants }) {
  return (
    <div className="card" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="card-header" style={{ padding: '16px 16px 12px 16px' }}>
        <h3 className="card-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          margin: 0,
          fontSize: '16px'
        }}>
          🍽️ Results
          <span style={{
            backgroundColor: restaurants.length > 0 ? 'var(--success-100)' : 'var(--gray-100)',
            color: restaurants.length > 0 ? 'var(--success-700)' : 'var(--gray-600)',
            padding: '2px 6px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            {restaurants.length}
          </span>
        </h3>
        <p className="card-subtitle" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
          Sorted by fairness to both users
        </p>
      </div>
      
      <div className="card-body" style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: restaurants.length === 0 ? '40px 20px' : '20px'
      }}>
        {restaurants.length === 0 ? (
          <div style={{ 
            textAlign: 'center',
            color: 'var(--gray-500)',
            fontSize: '14px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>
              No restaurants found yet
            </p>
            <p style={{ margin: 0, fontSize: '13px' }}>
              Select your preferences and starting location, then click "Find Perfect Restaurants"
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {restaurants.map((restaurant, index) => (
              <div
                key={restaurant.placeId}
                style={{
                  padding: '16px',
                  border: '1px solid var(--gray-200)',
                  borderRadius: '8px',
                  background: 'var(--gray-50)',
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--primary-50)';
                  e.target.style.borderColor = 'var(--primary-200)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--gray-50)';
                  e.target.style.borderColor = 'var(--gray-200)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--gray-900)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        backgroundColor: index < 3 ? 'var(--primary-500)' : 'var(--gray-400)',
                        color: 'white',
                        borderRadius: '50%',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {index + 1}
                      </span>
                      {restaurant.name}
                    </h4>
                    
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      color: 'var(--gray-600)',
                      marginBottom: '8px'
                    }}>
                      {restaurant.rating && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>⭐</span>
                          <strong>{restaurant.rating}</strong>
                          <span style={{ color: 'var(--gray-500)' }}>
                            ({restaurant.userRatingsTotal ?? 0})
                          </span>
                        </span>
                      )}
                      
                      {restaurant.sumDistanceKm && (
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          color: 'var(--success-600)',
                          fontWeight: '500'
                        }}>
                          <span>📏</span>
                          {restaurant.sumDistanceKm.toFixed(1)} km total
                        </span>
                      )}
                    </div>
                    
                    {restaurant.address && (
                      <div style={{ 
                        fontSize: '13px', 
                        color: 'var(--gray-500)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '4px'
                      }}>
                        <span>📍</span>
                        <span>{restaurant.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
