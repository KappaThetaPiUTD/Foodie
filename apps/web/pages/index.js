import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  // Redirect based on auth status
  useEffect(() => {
    if (currentUser) {
      router.push('/maps');
    } else {
      router.push('/landing');
    }
  }, [currentUser, router]);

  // Show loading while redirecting
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ color: '#666', fontSize: '1rem' }}>Loading FoodieMaps...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}


