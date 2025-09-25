import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push('/maps');
    }
  }, [currentUser, router]);

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      {/* Hero Section */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Logo/Title */}
        <h1 style={{
          fontSize: '4rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '16px',
          textShadow: '0 4px 8px rgba(0,0,0,0.2)',
          letterSpacing: '-2px'
        }}>
          🍽️ FoodieMaps
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '1.5rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '32px',
          lineHeight: '1.6',
          fontWeight: '300'
        }}>
          Discover restaurants together with friends
        </p>

        {/* Feature highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            padding: '24px',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>👥</div>
            <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '1.2rem' }}>Join Sessions</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Create or join dining sessions with friends using a simple session code
            </p>
          </div>

          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            padding: '24px',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎯</div>
            <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '1.2rem' }}>Share Preferences</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Input your cuisine preferences, dietary restrictions, and budget
            </p>
          </div>

          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            padding: '24px',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🗺️</div>
            <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '1.2rem' }}>Find Spots</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Get personalized restaurant recommendations that satisfy everyone
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleGetStarted}
          style={{
            backgroundColor: 'white',
            color: '#667eea',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '50px',
            fontSize: '1.2rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            minWidth: '200px'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
          }}
        >
          Get Started →
        </button>

        {/* Demo info */}
        <p style={{
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.7)',
          marginTop: '24px'
        }}>
          Free to use • No credit card required • Works on all devices
        </p>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.6)'
        }}>
          Powered by Google Maps & Places API • Built with React & Next.js
        </p>
      </div>
    </div>
  );
}
