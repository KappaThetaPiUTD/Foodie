import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../src/components/Map'), { ssr: false });

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: 'white',
          marginBottom: '8px',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          🍽️ FoodieMaps
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.9)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Discover restaurants together! Join the same session with friends to share preferences and find the perfect dining spot.
        </p>
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
  );
}


