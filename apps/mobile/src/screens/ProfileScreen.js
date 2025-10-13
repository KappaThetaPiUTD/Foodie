import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { auth } from '../lib/firebase';
import axios from 'axios';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

const cuisineOptions = [
  "Italian", "Mexican", "Chinese", "Japanese", "Thai", "Indian",
  "Mediterranean", "American", "Korean", "Vietnamese", "Greek",
  "French", "Spanish", "Middle Eastern", "Pizza", "Burgers", "Sushi"
];

const priceOptions = [
  { value: '$', label: '$ - Inexpensive' },
  { value: '$$', label: '$$ - Moderate' },
  { value: '$$$', label: '$$$ - Expensive' },
  { value: '$$$$', label: '$$$$ - Very Expensive' }
];

export default function ProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    cuisines: [],
    priceRange: '$$',
    openNow: true
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        navigation.replace('Login');
        return;
      }

      // Fetch user profile from server
      const response = await axios.get(`${SOCKET_URL}/user/profile/${user.uid}`);

      if (response.data.user) {
        setUserProfile(response.data.user);

        // Load preferences
        if (response.data.user.defaultPreferences) {
          setPreferences({
            cuisines: response.data.user.defaultPreferences.cuisines || [],
            priceRange: response.data.user.defaultPreferences.priceRange || '$$',
            openNow: response.data.user.defaultPreferences.openNow !== false
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);

      // If user doesn't exist in DB, create profile
      if (error.response?.status === 404) {
        await createUserProfile();
      }
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async () => {
    try {
      const user = auth.currentUser;

      const response = await axios.post(`${SOCKET_URL}/user/profile`, {
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        defaultPreferences: preferences
      });

      if (response.data.user) {
        setUserProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const handleCuisineToggle = (cuisine) => {
    setPreferences(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }));
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;

      await axios.put(`${SOCKET_URL}/user/preferences-enhanced/${user.uid}`, {
        cuisines: preferences.cuisines,
        priceRange: preferences.priceRange,
        openNow: preferences.openNow
      });

      Alert.alert('Success', 'Preferences saved successfully!');
      await loadUserProfile(); // Reload profile
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await auth.signOut();
            navigation.replace('Landing');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>
            {auth.currentUser?.displayName || auth.currentUser?.email}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Stats */}
        {userProfile && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userProfile.stats?.sessionsJoined || 0}
              </Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userProfile.stats?.restaurantsDiscovered || 0}
              </Text>
              <Text style={styles.statLabel}>Restaurants</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userProfile.favoriteRestaurants?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>
        )}

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Preferences</Text>
          <Text style={styles.sectionDescription}>
            Set your default preferences to save time when joining sessions.
          </Text>

          {/* Cuisines */}
          <Text style={styles.fieldLabel}>Favorite Cuisines</Text>
          <View style={styles.cuisineGrid}>
            {cuisineOptions.map(cuisine => (
              <TouchableOpacity
                key={cuisine}
                style={[
                  styles.cuisineChip,
                  preferences.cuisines.includes(cuisine) && styles.cuisineChipSelected
                ]}
                onPress={() => handleCuisineToggle(cuisine)}
              >
                <Text
                  style={[
                    styles.cuisineChipText,
                    preferences.cuisines.includes(cuisine) && styles.cuisineChipTextSelected
                  ]}
                >
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price Range */}
          <Text style={styles.fieldLabel}>Default Price Range</Text>
          <View style={styles.priceContainer}>
            {priceOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.priceOption,
                  preferences.priceRange === option.value && styles.priceOptionSelected
                ]}
                onPress={() => setPreferences(prev => ({ ...prev, priceRange: option.value }))}
              >
                <Text
                  style={[
                    styles.priceText,
                    preferences.priceRange === option.value && styles.priceTextSelected
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Open Now Toggle */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setPreferences(prev => ({ ...prev, openNow: !prev.openNow }))}
          >
            <View style={[styles.checkbox, preferences.openNow && styles.checkboxChecked]}>
              {preferences.openNow && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Prefer restaurants that are open now
            </Text>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSavePreferences}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#16a34a',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#16a34a',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  cuisineChip: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 4,
  },
  cuisineChipSelected: {
    backgroundColor: '#16a34a',
  },
  cuisineChipText: {
    fontSize: 14,
    color: '#333',
  },
  cuisineChipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  priceContainer: {
    marginBottom: 24,
  },
  priceOption: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  priceOptionSelected: {
    backgroundColor: '#16a34a',
  },
  priceText: {
    fontSize: 16,
    color: '#333',
  },
  priceTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
