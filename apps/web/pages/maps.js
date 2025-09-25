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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        {/* Header with user info and logout */}
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
              🍽️ FoodieMaps
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.8)',
              margin: 0
            }}>
              Welcome back, {currentUser?.displayName || currentUser?.email}!
            </p>
          </div>
          
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
            color: 'rgba(255,255,255,0.7)'
          }}>
            Powered by Google Maps & Places API • Built with React & Next.js
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
