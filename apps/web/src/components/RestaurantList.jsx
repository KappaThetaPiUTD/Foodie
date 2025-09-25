export default function RestaurantList({ restaurants }) {
  return (
    <div style={{
      marginTop: 12,
      background: 'white',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      padding: 12,
      maxHeight: '30vh',
      overflowY: 'auto'
    }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>
        Overlapped Restaurants ({restaurants.length})
      </div>
      
      {restaurants.length === 0 ? (
        <div style={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
          No restaurants found. Try adjusting your preferences or locations.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {restaurants.map((restaurant, index) => (
            <div
              key={restaurant.placeId}
              style={{
                padding: 12,
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                background: '#f9fafb'
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {index + 1}. {restaurant.name}
              </div>
              
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 2 }}>
                <strong>Rating:</strong> {restaurant.rating ?? 'N/A'} ⭐ 
                ({restaurant.userRatingsTotal ?? 0} reviews)
              </div>
              
              {restaurant.address && (
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  📍 {restaurant.address}
                </div>
              )}
              
              {restaurant.sumDistanceKm && (
                <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
                  Total distance to both users: {restaurant.sumDistanceKm.toFixed(1)} km
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
