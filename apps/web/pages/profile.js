import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import { useUser } from '../src/hooks/useUser';
import ProtectedRoute from '../src/components/ProtectedRoute';

const cuisineOptions = [
  "Italian", "Mexican", "Chinese", "Japanese", "Thai", "Indian", 
  "Mediterranean", "American", "Korean", "Vietnamese", "Greek", 
  "French", "Spanish", "Middle Eastern", "Pizza", "Burgers", "Sushi"
];

const priceOptions = [
  { value: '$', label: '$ - Inexpensive' },
  { value: '$$', label: '$$ - Moderate' },
  { value: '$$$', label: '$$$ - Expensive' },
  { value: '$$$$', label: '$$$$ - Very Expensive' }
];

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { userProfile, updatePreferences, loading, error } = useUser();
  
  const [preferences, setPreferences] = useState({
    cuisines: [],
    priceRange: '$$',
    openNow: true
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load user preferences when profile loads
  useEffect(() => {
    if (userProfile?.defaultPreferences) {
      setPreferences({
        cuisines: userProfile.defaultPreferences.cuisines || [],
        priceRange: userProfile.defaultPreferences.priceRange || '$$',
        openNow: userProfile.defaultPreferences.openNow !== false
      });
    }
  }, [userProfile]);

  const handleCuisineToggle = (cuisine) => {
    setPreferences(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }));
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setSaveMessage('');

    const success = await updatePreferences(preferences);
    
    if (success) {
      setSaveMessage('Preferences saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('Failed to save preferences. Please try again.');
    }

    setSaving(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: '16px 24px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 4px 0',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              User Profile
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.8)',
              margin: 0
            }}>
              {currentUser?.displayName || currentUser?.email}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => router.push('/maps')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }}
            >
              Back to Maps
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }}>
          {loading && (
            <div style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
              Loading profile...
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* User Stats */}
          {userProfile && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                  {userProfile.stats?.sessionsJoined || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Sessions Joined</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                  {userProfile.stats?.restaurantsDiscovered || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Restaurants Found</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                  {userProfile.favoriteRestaurants?.length || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Favorites</div>
              </div>
            </div>
          )}

          <h2 style={{ color: '#333', marginBottom: '24px' }}>Default Food Preferences</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Set your default preferences to save time when joining sessions. You can always override these in individual sessions.
          </p>

          {/* Cuisine Preferences */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#333', marginBottom: '12px' }}>Favorite Cuisines</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '8px'
            }}>
              {cuisineOptions.map(cuisine => (
                <label key={cuisine} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: preferences.cuisines.includes(cuisine) ? '#667eea' : '#f0f0f0',
                  color: preferences.cuisines.includes(cuisine) ? 'white' : '#333',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '14px'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.cuisines.includes(cuisine)}
                    onChange={() => handleCuisineToggle(cuisine)}
                    style={{ marginRight: '6px' }}
                  />
                  {cuisine}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#333', marginBottom: '12px' }}>Default Price Range</h3>
            <select
              value={preferences.priceRange}
              onChange={(e) => setPreferences(prev => ({ ...prev, priceRange: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              {priceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Open Now */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#333'
            }}>
              <input
                type="checkbox"
                checked={preferences.openNow}
                onChange={(e) => setPreferences(prev => ({ ...prev, openNow: e.target.checked }))}
                style={{ marginRight: '8px', transform: 'scale(1.2)' }}
              />
              Prefer restaurants that are open now
            </label>
          </div>

          {/* Save Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleSavePreferences}
              disabled={saving}
              style={{
                backgroundColor: saving ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s',
                minWidth: '150px'
              }}
              onMouseOver={(e) => {
                if (!saving) e.target.style.backgroundColor = '#5a6fd8';
              }}
              onMouseOut={(e) => {
                if (!saving) e.target.style.backgroundColor = '#667eea';
              }}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>

            {saveMessage && (
              <div style={{
                marginTop: '12px',
                color: saveMessage.includes('successfully') ? '#28a745' : '#dc3545',
                fontSize: '14px'
              }}>
                {saveMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
