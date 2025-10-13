import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../lib/firebase';
import axios from 'axios';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

const UserContext = createContext();

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load user profile from server
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        setUserProfile(null);
        return;
      }

      const response = await axios.get(`${SOCKET_URL}/user/profile/${user.uid}`);

      if (response.data.user) {
        setUserProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);

      // If user doesn't exist, create profile
      if (error.response?.status === 404) {
        await createUserProfile();
      }
    } finally {
      setLoading(false);
    }
  };

  // Create user profile
  const createUserProfile = async () => {
    try {
      const user = auth.currentUser;

      const response = await axios.post(`${SOCKET_URL}/user/profile`, {
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        defaultPreferences: {
          cuisines: [],
          priceRange: '$$',
          openNow: true
        }
      });

      if (response.data.user) {
        setUserProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      const user = auth.currentUser;

      await axios.put(`${SOCKET_URL}/user/preferences-enhanced/${user.uid}`, {
        cuisines: preferences.cuisines,
        priceRange: preferences.priceRange,
        openNow: preferences.openNow
      });

      // Reload profile after update
      await loadUserProfile();
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  };

  // Update user location
  const updateLocation = async (lat, lng, address) => {
    try {
      const user = auth.currentUser;

      await axios.put(`${SOCKET_URL}/user/location/${user.uid}`, {
        lat,
        lng,
        address
      });

      await loadUserProfile();
      return true;
    } catch (error) {
      console.error('Error updating location:', error);
      return false;
    }
  };

  // Load profile when auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadUserProfile();
      } else {
        setUserProfile(null);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    userProfile,
    loading,
    loadUserProfile,
    createUserProfile,
    updatePreferences,
    updateLocation
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
