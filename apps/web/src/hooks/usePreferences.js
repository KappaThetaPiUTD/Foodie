import { useState, useCallback } from 'react';

export const cuisineOptions = [
  'Pizza','Sushi','Burgers','Mexican','Italian','Chinese','Indian','Thai','BBQ','Vegan'
];

export function usePreferences() {
  const [myPreferences, setMyPreferences] = useState({ 
    cuisines: [], 
    price: 'any', 
    openNow: false 
  });
  const [peerPreferences, setPeerPreferences] = useState({ 
    cuisines: [], 
    price: 'any', 
    openNow: false 
  });

  const updatePreferences = useCallback((newPrefs, broadcastFn, saveFn) => {
    setMyPreferences(newPrefs);
    
    // Broadcast to other tabs
    if (broadcastFn) {
      broadcastFn({ type: 'preferencesUpdate', payload: newPrefs });
    }
    
    // Save to localStorage
    if (saveFn) {
      saveFn({ myPreferences: newPrefs });
    }
  }, []);

  const toggleCuisine = useCallback((cuisine, broadcastFn, saveFn) => {
    setMyPreferences(prev => {
      const newCuisines = prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine];
      
      const newPrefs = { ...prev, cuisines: newCuisines };
      
      // Broadcast and save
      if (broadcastFn) {
        broadcastFn({ type: 'preferencesUpdate', payload: newPrefs });
      }
      if (saveFn) {
        saveFn({ myPreferences: newPrefs });
      }
      
      return newPrefs;
    });
  }, []);

  const setPrice = useCallback((price, broadcastFn, saveFn) => {
    setMyPreferences(prev => {
      const newPrefs = { ...prev, price };
      
      // Broadcast and save
      if (broadcastFn) {
        broadcastFn({ type: 'preferencesUpdate', payload: newPrefs });
      }
      if (saveFn) {
        saveFn({ myPreferences: newPrefs });
      }
      
      return newPrefs;
    });
  }, []);

  const setOpenNow = useCallback((openNow, broadcastFn, saveFn) => {
    setMyPreferences(prev => {
      const newPrefs = { ...prev, openNow };
      
      // Broadcast and save
      if (broadcastFn) {
        broadcastFn({ type: 'preferencesUpdate', payload: newPrefs });
      }
      if (saveFn) {
        saveFn({ myPreferences: newPrefs });
      }
      
      return newPrefs;
    });
  }, []);

  const loadPreferences = useCallback((savedPrefs) => {
    if (savedPrefs?.myPreferences) {
      setMyPreferences(savedPrefs.myPreferences);
    }
    if (savedPrefs?.peerPreferences) {
      setPeerPreferences(savedPrefs.peerPreferences);
    }
  }, []);

  return {
    myPreferences,
    peerPreferences,
    setPeerPreferences,
    updatePreferences,
    toggleCuisine,
    setPrice,
    setOpenNow,
    loadPreferences
  };
}
