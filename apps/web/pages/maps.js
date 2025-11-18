import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState } from 'react';
import ProtectedRoute from '../src/components/ProtectedRoute';
import PillNav from '../src/components/PillNav';
import { useAuth } from '../src/context/AuthContext';

const Map = dynamic(() => import('../src/components/Map'), { ssr: false });

export default function MapsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [openPanel, setOpenPanel] = useState(null); // 'preferences', 'session', or null

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/landing');
    } catch (e) {
      // no-op
    }
  };

  const handlePreferences = () => {
    setOpenPanel(openPanel === 'preferences' ? null : 'preferences');
  };

  const handleSession = () => {
    setOpenPanel(openPanel === 'session' ? null : 'session');
  };

  // Navigation items for maps screen - context-specific actions
  const navItems = [
    { label: 'Preferences', onClick: handlePreferences },
    { label: 'Session', onClick: handleSession },
    { href: '/profile', label: 'Settings' },
    { label: 'Logout', onClick: handleLogout }
  ];

  return (
    <ProtectedRoute>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #d9f99d 0%, #bbf7d0 100%)'
      }}>
        {/* PillNav at the top */}
        <div style={{ paddingTop: '20px', paddingLeft: '20px', paddingRight: '20px' }}>
          <PillNav
            logo="/FoodieLogo.png"
            logoAlt="FoodieMaps"
            items={navItems}
            activeHref={router.pathname}
            baseColor="#111827"
            pillColor="#16a34a"
            hoveredPillTextColor="#111827"
            pillTextColor="#111827"
            initialLoadAnimation={false}
          />
        </div>

        {/* Main Content with proper spacing */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px',
          paddingTop: '24px'
        }}>
          <Map openPanel={openPanel} onClosePanel={() => setOpenPanel(null)} />
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
