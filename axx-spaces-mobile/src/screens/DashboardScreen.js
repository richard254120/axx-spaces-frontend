import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { propertyAPI, tourismAPI, businessAPI } from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    properties: 0,
    tourism: 0,
    business: 0,
    views: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      // Load stats based on user role
      if (user?.role === 'landlord') {
        const properties = await propertyAPI.getProperties({ landlordId: user._id });
        setStats(prev => ({ ...prev, properties: properties.properties?.length || 0 }));
      } else if (user?.role === 'tourism') {
        const tourism = await tourismAPI.getListings({ providerId: user._id });
        setStats(prev => ({ ...prev, tourism: tourism.listings?.length || 0 }));
      } else if (user?.role === 'business') {
        const business = await businessAPI.getBusinesses({ ownerId: user._id });
        setStats(prev => ({ ...prev, business: business.businesses?.length || 0 }));
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardActions = [
    { id: 1, title: 'Add Property', icon: '➕', screen: 'AddProperty', role: 'landlord' },
    { id: 2, title: 'Add Tourism Listing', icon: '➕', screen: 'AddTourism', role: 'landlord' },
    { id: 3, title: 'Add Business', icon: '➕', screen: 'AddBusiness', role: 'business' },
    { id: 4, title: 'My Bookings', icon: '📅', screen: 'Bookings', role: 'all' },
    { id: 5, title: 'Analytics', icon: '📊', screen: 'Analytics', role: 'all' },
    { id: 6, title: 'Settings', icon: '⚙️', screen: 'Settings', role: 'all' },
  ];

  const availableActions = dashboardActions.filter(
    action => action.role === 'all' || action.role === user?.role
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#fbbf24" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome back, {user?.name?.split(' ')[0] || 'User'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🏠</Text>
          <Text style={styles.statValue}>{stats.properties}</Text>
          <Text style={styles.statLabel}>Properties</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✈️</Text>
          <Text style={styles.statValue}>{stats.tourism}</Text>
          <Text style={styles.statLabel}>Tourism</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💼</Text>
          <Text style={styles.statValue}>{stats.business}</Text>
          <Text style={styles.statLabel}>Business</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👁️</Text>
          <Text style={styles.statValue}>{stats.views}</Text>
          <Text style={styles.statLabel}>Views</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {availableActions.map((action) => (
            <TouchableOpacity 
              key={action.id}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          <Text style={styles.noActivityText}>No recent activity</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1729',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#1e293b',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 15,
  },
  statCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  statValue: {
    color: '#fbbf24',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  noActivityText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default DashboardScreen;
