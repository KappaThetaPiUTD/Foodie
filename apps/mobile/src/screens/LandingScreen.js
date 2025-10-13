import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image
} from 'react-native';

export default function LandingScreen({ navigation }) {
  const teamMembers = [
    { name: 'Aadhav M.', role: 'Full Stack Dev' },
    { name: 'Ishaan D.', role: 'Frontend Dev' },
    { name: 'Vignesh S.', role: 'Frontend Dev' },
    { name: 'Ethan L.', role: 'Frontend Dev' },
    { name: 'Ajay K.', role: 'UI/UX Designer' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🍽️</Text>
        </View>

        <Text style={styles.title}>FoodieMaps</Text>

        <Text style={styles.subtitle}>
          Finding the perfect restaurant for your group has never been easier.
          FoodieMaps brings together everyone's preferences to discover dining spots
          that satisfy the entire party.
        </Text>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.freeText}>
          Free to use • No credit card required
        </Text>
      </View>

      {/* How to Use Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to Use FoodieMaps</Text>

        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepTitle}>Create or Join Session</Text>
          <Text style={styles.stepDescription}>
            Start a new dining session or join an existing one using a unique session code.
          </Text>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepTitle}>Set Your Preferences</Text>
          <Text style={styles.stepDescription}>
            Enter your location, select cuisine types, dietary restrictions, and budget range.
          </Text>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepTitle}>Discover Restaurants</Text>
          <Text style={styles.stepDescription}>
            Our algorithm finds restaurants that match everyone's preferences and shows them on the map.
          </Text>
        </View>
      </View>

      {/* Team Section */}
      <View style={styles.teamSection}>
        <Text style={styles.sectionTitle}>Meet the Team</Text>

        <View style={styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.teamCard}>
              <View style={styles.teamAvatar}>
                <Text style={styles.teamAvatarText}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <Text style={styles.teamName}>{member.name}</Text>
              <Text style={styles.teamRole}>{member.role}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.ktpText}>
          Made by members of Kappa Theta Pi UTD
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by Google Maps & Places API
        </Text>
        <Text style={styles.footerText}>
          © 2025 FoodieMaps. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  heroSection: {
    backgroundColor: '#d9f99d',
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  getStartedButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedText: {
    color: '#16a34a',
    fontSize: 18,
    fontWeight: '600',
  },
  freeText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 16,
  },
  section: {
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 32,
  },
  stepCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  stepNumber: {
    width: 50,
    height: 50,
    backgroundColor: '#86efac',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumberText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#065f46',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  teamSection: {
    padding: 20,
    backgroundColor: '#ffedd5',
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  teamCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 16,
    borderRadius: 16,
    margin: 8,
    width: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  teamAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fed7aa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  teamRole: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  ktpText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    padding: 24,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginVertical: 4,
  },
});
