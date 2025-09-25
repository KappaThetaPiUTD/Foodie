import { useState, useRef, useCallback } from 'react';

export function useRouting() {
  const originAutocomplete = useRef(null);
  const destinationAutocomplete = useRef(null);
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  
  const [myDirections, setMyDirections] = useState(null);
  const [peerDirections, setPeerDirections] = useState(null);
  const [lastRoute, setLastRoute] = useState({ origin: '', destination: '' });
  const [peerOriginText, setPeerOriginText] = useState('');

  const sendOriginUpdate = useCallback((broadcastFn, saveFn) => {
    const val = originInputRef.current?.value?.trim() || '';
    
    if (saveFn) {
      saveFn({ myOriginText: val });
    }
    
    if (broadcastFn) {
      broadcastFn({ type: 'originUpdate', payload: val });
    }
  }, []);

  const onOriginPlaceChanged = useCallback((broadcastFn, saveFn) => {
    try {
      const place = originAutocomplete.current?.getPlace?.();
      const val = place?.formatted_address || place?.name || '';
      if (originInputRef.current && val) {
        originInputRef.current.value = val;
        sendOriginUpdate(broadcastFn, saveFn);
      }
    } catch (_) {}
  }, [sendOriginUpdate]);

  const calculateRoute = useCallback(async (broadcastFn, saveFn, myPreferences) => {
    if (!window.google) return;
    
    const origin = originInputRef.current?.value;
    const destination = destinationInputRef.current?.value;
    if (!origin || !destination) return;
    
    sendOriginUpdate(broadcastFn, saveFn);

    const directionsService = new google.maps.DirectionsService();
    const result = await directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    });
    
    setMyDirections(result);
    setLastRoute({ origin, destination });

    // Save route and preferences
    if (saveFn) {
      saveFn({
        lastRoute: { origin, destination },
        myPreferences
      });
    }

    // Broadcast to other tabs
    if (broadcastFn) {
      broadcastFn({ type: 'routeUpdate', payload: { origin, destination } });
    }
  }, [sendOriginUpdate]);

  const clearRoute = useCallback((broadcastFn, saveFn) => {
    setMyDirections(null);
    setPeerDirections(null);
    
    // Clear inputs
    if (originInputRef.current) originInputRef.current.value = '';
    if (destinationInputRef.current) destinationInputRef.current.value = '';

    // Save cleared state
    if (saveFn) {
      saveFn({ lastRoute: { origin: '', destination: '' } });
    }

    // Broadcast route clear
    if (broadcastFn) {
      broadcastFn({ type: 'routeClear' });
      broadcastFn({ type: 'restaurantsUpdate', payload: [] });
    }
  }, []);

  const loadRoute = useCallback(async (savedRoute) => {
    if (!savedRoute?.origin || !savedRoute?.destination || !window.google) return;
    
    if (originInputRef.current) originInputRef.current.value = savedRoute.origin;
    if (destinationInputRef.current) destinationInputRef.current.value = savedRoute.destination;
    
    try {
      const directionsService = new google.maps.DirectionsService();
      const result = await directionsService.route({
        origin: savedRoute.origin,
        destination: savedRoute.destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setMyDirections(result);
      setLastRoute(savedRoute);
    } catch (_) {}
  }, []);

  const handlePeerRouteUpdate = useCallback(async (origin, destination) => {
    if (!window.google || !origin || !destination) return;
    
    try {
      const directionsService = new google.maps.DirectionsService();
      const result = await directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setPeerDirections(result);
    } catch (_) {}
  }, []);

  return {
    originAutocomplete,
    destinationAutocomplete,
    originInputRef,
    destinationInputRef,
    myDirections,
    peerDirections,
    lastRoute,
    peerOriginText,
    setPeerOriginText,
    sendOriginUpdate,
    onOriginPlaceChanged,
    calculateRoute,
    clearRoute,
    loadRoute,
    handlePeerRouteUpdate,
    setPeerDirections
  };
}
