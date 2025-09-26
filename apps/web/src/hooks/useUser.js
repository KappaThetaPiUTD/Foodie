import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useUser() {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

  // Create or update user profile
  const createOrUpdateProfile = useCallback(async (profileData) => {
    if (!currentUser) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${serverUrl}/user/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || profileData?.displayName,
          defaultPreferences: profileData?.defaultPreferences,
          savedLocations: profileData?.savedLocations,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create/update profile');
      }

      const data = await response.json();
      setUserProfile(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      console.error('Error creating/updating profile:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, serverUrl]);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!currentUser) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${serverUrl}/user/profile/${currentUser.uid}`);

      if (response.status === 404) {
        // User doesn't exist, create profile with basic info
        return await createOrUpdateProfile({
          displayName: currentUser.displayName || currentUser.email?.split('@')[0],
        });
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUserProfile(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching profile:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, serverUrl, createOrUpdateProfile]);

  // Update user preferences
  const updatePreferences = useCallback(async (preferences) => {
    if (!currentUser) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${serverUrl}/user/preferences/${currentUser.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          defaultPreferences: preferences,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const data = await response.json();
      
      // Update local state
      setUserProfile(prev => prev ? {
        ...prev,
        defaultPreferences: data.defaultPreferences
      } : null);

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error updating preferences:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, serverUrl]);

  // Add favorite restaurant
  const addFavorite = useCallback(async (placeId, name) => {
    if (!currentUser) return false;

    try {
      const response = await fetch(`${serverUrl}/user/favorites/${currentUser.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placeId, name }),
      });

      if (!response.ok) {
        throw new Error('Failed to add favorite');
      }

      const data = await response.json();
      
      // Update local state
      setUserProfile(prev => prev ? {
        ...prev,
        favoriteRestaurants: data.favoriteRestaurants
      } : null);

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error adding favorite:', err);
      return false;
    }
  }, [currentUser, serverUrl]);

  // Auto-fetch profile when user logs in
  useEffect(() => {
    if (currentUser && !userProfile) {
      fetchProfile();
    }
  }, [currentUser, userProfile, fetchProfile]);

  // Clear profile when user logs out
  useEffect(() => {
    if (!currentUser) {
      setUserProfile(null);
      setError(null);
    }
  }, [currentUser]);

  return {
    userProfile,
    loading,
    error,
    createOrUpdateProfile,
    fetchProfile,
    updatePreferences,
    addFavorite,
    // Helper getters
    hasProfile: !!userProfile,
    defaultPreferences: userProfile?.defaultPreferences || {},
    savedLocations: userProfile?.savedLocations || [],
    stats: userProfile?.stats || { sessionsJoined: 0, restaurantsDiscovered: 0 },
  };
}
