import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (e) {
      // no-op
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'saturate(180%) blur(8px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img src="/FoodieLogo.png" alt="FoodieMaps" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            </div>
            <span style={{ fontWeight: 700, color: '#111827', letterSpacing: -0.2 }}>FoodieMaps</span>
          </Link>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/landing" style={{ color: '#374151', textDecoration: 'none' }}>Landing</Link>
          <Link href="/maps" style={{ color: '#374151', textDecoration: 'none' }}>Maps</Link>
          {currentUser ? (
            <>
              <Link href="/profile" style={{ color: '#374151', textDecoration: 'none' }}>Profile</Link>
              <button
                onClick={handleLogout}
                style={{
                  background: '#111827',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" style={{
              background: '#111827',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: 8
            }}>Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}


