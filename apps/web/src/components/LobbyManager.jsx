export default function LobbyManager({ 
  sessionInputRef,
  onJoinSession, 
  joined 
}) {

  return (
    <div style={{
      position: 'absolute',
      zIndex: 20,
      top: 12,
      right: 12,
      background: 'white',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      padding: 12,
      width: 'min(40vw, 300px)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontWeight: 600 }}>Session Management</div>
        
        {!joined ? (
          <>
            <input
              ref={sessionInputRef}
              placeholder="Enter session ID"
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #ddd',
                borderRadius: 6,
              }}
            />
            <button
              onClick={onJoinSession}
              style={{
                background: '#059669',
                color: 'white',
                border: 0,
                borderRadius: 6,
                padding: '8px 12px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Join Session
            </button>
          </>
        ) : (
          <div style={{
            padding: '8px 12px',
            background: '#dcfce7',
            border: '1px solid #16a34a',
            borderRadius: 6,
            color: '#15803d',
            fontSize: 14,
            fontWeight: 500
          }}>
            ✓ Connected to session
          </div>
        )}
        
        <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>
          Share the same session ID with friends to collaborate on finding restaurants together.
        </div>
      </div>
    </div>
  );
}
