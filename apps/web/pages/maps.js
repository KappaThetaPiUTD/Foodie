import dynamic from 'next/dynamic';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'next/router';
import ProtectedRoute from '../src/components/ProtectedRoute';

const Map = dynamic(() => import('../src/components/Map'), { ssr: false });

export default function MapsPage() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

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
        background: 'linear-gradient(135deg, #d9f99d 0%, #bbf7d0 100%)',
        padding: '20px'
      }}>
        {/* Header with user info and logout */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          backgroundColor: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          border: '1px solid rgba(17,24,39,0.08)'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 4px 0',
              textShadow: 'none'
            }}>
              FoodieMaps
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#374151',
              margin: 0
            }}>
              Welcome back, {currentUser?.displayName || currentUser?.email}!
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => router.push('/profile')}
              style={{
                backgroundColor: 'transparent',
                color: '#16a34a',
                border: '1px solid #16a34a',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#16a34a';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#16a34a';
              }}
            >
              Profile
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#16a34a',
                color: 'white',
                border: '1px solid #16a34a',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#15803d';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#16a34a';
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <Map />
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          padding: '20px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#374151'
          }}>
            Powered by Google Maps & Places API • Built with React & Next.js
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
