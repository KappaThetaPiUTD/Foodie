import dynamic from 'next/dynamic';
import ProtectedRoute from '../src/components/ProtectedRoute';
import Header from '../src/components/Header';

const Map = dynamic(() => import('../src/components/Map'), { ssr: false });

export default function MapsPage() {

  return (
    <ProtectedRoute>
      <Header />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #d9f99d 0%, #bbf7d0 100%)',
        padding: '20px'
      }}>

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
