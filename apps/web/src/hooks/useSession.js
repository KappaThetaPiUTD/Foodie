import { useState, useRef, useCallback } from 'react';

export function useSession() {
  const [sessionId, setSessionId] = useState('');
  const [joined, setJoined] = useState(false);
  const bcRef = useRef(null);
  const sessionInputRef = useRef(null);

  const joinSession = useCallback((onMessage) => {
    const id = sessionInputRef.current?.value?.trim();
    if (!id) return;
    
    setSessionId(id);
    setJoined(true);
    
    // Close existing broadcast channel
    try { 
      bcRef.current?.close?.(); 
    } catch (_) {}
    
    // Create new broadcast channel
    bcRef.current = new BroadcastChannel(`foodie-${id}`);
    bcRef.current.onmessage = onMessage;

    // Load persisted state for this session
    const key = `foodie:session:${id}`;
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    
    return saved;
  }, []);

  const broadcastMessage = useCallback((message) => {
    if (joined && bcRef.current) {
      bcRef.current.postMessage(message);
    }
  }, [joined]);

  const saveToSession = useCallback((data) => {
    if (sessionId) {
      const key = `foodie:session:${sessionId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({
        ...existing,
        ...data,
        updatedAt: Date.now()
      }));
    }
  }, [sessionId]);

  return {
    sessionId,
    joined,
    sessionInputRef,
    joinSession,
    broadcastMessage,
    saveToSession
  };
}
