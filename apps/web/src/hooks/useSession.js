import { useState, useRef, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';

export function useSession() {
  const [sessionId, setSessionId] = useState('');
  const [joined, setJoined] = useState(false);
  const bcRef = useRef(null);
  const sessionInputRef = useRef(null);
  const socketRef = useRef(null);

  const joinSession = useCallback((onMessage) => {
    const id = sessionInputRef.current?.value?.trim();
    if (!id) return;
    
    setSessionId(id);
    setJoined(true);
    
    // Connect to Socket.IO server for cross-device sync
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
      
      socketRef.current.on('connect', () => {
        console.log('Connected to server');
        socketRef.current.emit('joinSession', id);
      });

      // Set up Socket.IO message handlers
      socketRef.current.on('routeUpdate', (data) => {
        onMessage({ data: { type: 'routeUpdate', payload: data } });
      });

      socketRef.current.on('routeClear', (data) => {
        onMessage({ data: { type: 'routeClear', payload: data } });
      });

      socketRef.current.on('preferencesUpdate', (data) => {
        onMessage({ data: { type: 'preferencesUpdate', payload: data.preferences } });
      });

      socketRef.current.on('restaurantsUpdate', (data) => {
        onMessage({ data: { type: 'restaurantsUpdate', payload: data.restaurants } });
      });

      socketRef.current.on('originUpdate', (data) => {
        onMessage({ data: { type: 'originUpdate', payload: data.originText } });
      });

      // Handle session data from server (for recovery)
      socketRef.current.on('sessionData', (data) => {
        console.log('Received session data from server:', data);
        // Restore session data from MongoDB
        if (data.restaurants && data.restaurants.length > 0) {
          onMessage({ data: { type: 'restaurantsUpdate', payload: data.restaurants } });
        }
        if (data.users && data.users.length > 0) {
          // Find other users' data
          data.users.forEach(user => {
            if (user.socketId !== socketRef.current.id) {
              if (user.preferences) {
                onMessage({ data: { type: 'preferencesUpdate', payload: user.preferences } });
              }
              if (user.originText) {
                onMessage({ data: { type: 'originUpdate', payload: user.originText } });
              }
            }
          });
        }
      });
    }
    
    // Close existing broadcast channel
    try { 
      bcRef.current?.close?.(); 
    } catch (_) {}
    
    // Create new broadcast channel for same-browser tabs
    bcRef.current = new BroadcastChannel(`foodie-${id}`);
    bcRef.current.onmessage = onMessage;

    // Load persisted state for this session
    const key = `foodie:session:${id}`;
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    
    return saved;
  }, []);

  const broadcastMessage = useCallback((message) => {
    // Broadcast to same-browser tabs
    if (joined && bcRef.current) {
      bcRef.current.postMessage(message);
    }
    
    // Send to Socket.IO for cross-device sync
    if (joined && socketRef.current && sessionId) {
      const socketEvent = {
        sessionId,
        ...message.payload
      };
      
      switch (message.type) {
        case 'routeUpdate':
          socketRef.current.emit('routeUpdate', socketEvent);
          break;
        case 'routeClear':
          socketRef.current.emit('routeClear', { sessionId });
          break;
        case 'preferencesUpdate':
          socketRef.current.emit('preferencesUpdate', { sessionId, preferences: message.payload });
          break;
        case 'restaurantsUpdate':
          socketRef.current.emit('restaurantsUpdate', { sessionId, restaurants: message.payload });
          break;
        case 'originUpdate':
          socketRef.current.emit('originUpdate', { sessionId, originText: message.payload });
          break;
      }
    }
  }, [joined, sessionId]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        bcRef.current?.close?.();
        socketRef.current?.disconnect?.();
      } catch (_) {}
    };
  }, []);

  return {
    sessionId,
    joined,
    sessionInputRef,
    joinSession,
    broadcastMessage,
    saveToSession
  };
}
