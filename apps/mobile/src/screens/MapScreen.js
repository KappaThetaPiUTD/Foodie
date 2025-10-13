import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { socket } from '../lib/socketClient';
import { auth } from '../lib/firebase';

export default function MapScreen({ navigation }) {
  const [sessionId, setSessionId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [restaurants, setRestaurants] = useState([]);
  const [preferences, setPreferences] = useState({
    cuisines: [],
    priceRange: '',
    openNow: false
  });

  useEffect(() => {
    getLocation();
    setupSocketListeners();

    return () => {
      socket.off('preferences-updated');
      socket.off('restaurants-found');
    };
  }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
    setRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const setupSocketListeners = () => {
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('preferences-updated', (data) => {
      console.log('Preferences updated:', data);
    });

    socket.on('restaurants-found', (data) => {
      console.log('Restaurants found:', data);
      setRestaurants(data.restaurants || []);
    });
  };

  const joinSession = () => {
    if (!sessionId.trim()) {
      Alert.alert('Error', 'Please enter a session ID');
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join-session', {
      sessionId: sessionId.trim(),
      userId: auth.currentUser?.uid || 'anonymous'
    });

    Alert.alert('Success', `Joined session: ${sessionId}`);
  };

  const handleLogout = () => {
    auth.signOut();
    if (socket.connected) {
      socket.disconnect();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FoodieMaps</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Session Manager */}
      <View style={styles.sessionContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Session ID"
          value={sessionId}
          onChangeText={setSessionId}
        />
        <TouchableOpacity
          style={[styles.button, isConnected && styles.buttonConnected]}
          onPress={joinSession}
        >
          <Text style={styles.buttonText}>
            {isConnected ? 'Connected' : 'Join Session'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation
        showsMyLocationButton
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude
            }}
            title="You"
            pinColor="blue"
          />
        )}

        {restaurants.map((restaurant, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: restaurant.geometry?.location?.lat || 0,
              longitude: restaurant.geometry?.location?.lng || 0
            }}
            title={restaurant.name}
            description={restaurant.vicinity}
            pinColor="red"
          />
        ))}
      </MapView>

      {/* Restaurant List */}
      {restaurants.length > 0 && (
        <View style={styles.restaurantList}>
          <Text style={styles.listTitle}>Found {restaurants.length} restaurants</Text>
          <ScrollView>
            {restaurants.map((restaurant, index) => (
              <View key={index} style={styles.restaurantCard}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantAddress}>{restaurant.vicinity}</Text>
                <Text style={styles.restaurantRating}>
                  ⭐ {restaurant.rating || 'N/A'}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
  },
  sessionContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonConnected: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  restaurantList: {
    height: 200,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 10,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  restaurantCard: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  restaurantRating: {
    fontSize: 14,
    color: '#333',
  },
});
