export default function LobbyManager({ 
  sessionInputRef,
  onJoinSession, 
  joined 
}) {

  return (
    <div className="card" style={{
      width: '280px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ 
          margin: 0,
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--gray-900)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          🔗 Session
        </h4>
        
        {!joined ? (
          <>
            <input
              ref={sessionInputRef}
              placeholder="Session ID (e.g. ABC123)"
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '12px',
                border: '1px solid var(--gray-300)',
                borderRadius: '4px'
              }}
            />
            
            <button
              onClick={onJoinSession}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: 'var(--success-500)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🚀 Join Session
            </button>
          </>
        ) : (
          <>
            <div style={{ 
              padding: '6px 10px',
              backgroundColor: 'var(--success-100)',
              color: 'var(--success-700)',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              ✓ Connected
            </div>
            
            <button
              onClick={() => {
                if (confirm('Clear all session data? This will refresh the page.')) {
                  // Clear localStorage for this session
                  const sessionKeys = Object.keys(localStorage).filter(key => 
                    key.startsWith('foodie:session:')
                  );
                  sessionKeys.forEach(key => localStorage.removeItem(key));
                  
                  // Refresh page to reset state
                  window.location.reload();
                }
              }}
              style={{
                width: '100%',
                padding: '4px 8px',
                fontSize: '11px',
                backgroundColor: 'var(--error-100)',
                color: 'var(--error-600)',
                border: '1px solid var(--error-300)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🗑️ Clear Data
            </button>
          </>
        )}
        
        <p style={{ 
          margin: 0,
          fontSize: '11px', 
          color: 'var(--gray-500)',
          lineHeight: 1.3
        }}>
          Share session ID with friends
        </p>
      </div>
    </div>
  );
}
