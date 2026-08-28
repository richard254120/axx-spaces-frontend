import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  TextInput 
} from 'react-native';
import { businessAPI } from '../services/api';

const BusinessScreen = ({ navigation }) => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await businessAPI.getBusinesses();
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        business.name?.toLowerCase().includes(query) ||
        business.category?.toLowerCase().includes(query) ||
        business.location?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const renderBusinessCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.businessCard}
      onPress={() => navigation.navigate('BusinessDetail', { id: item._id })}
    >
      <Image 
        source={{ uri: item.logo || 'https://via.placeholder.com/100' }} 
        style={styles.businessLogo}
      />
      <View style={styles.businessInfo}>
        <Text style={styles.businessName}>{item.name}</Text>
        <Text style={styles.businessCategory}>{item.category}</Text>
        <Text style={styles.businessLocation}>📍 {item.location}</Text>
        <View style={styles.businessRating}>
          <Text style={styles.ratingText}>⭐ {item.rating || 4.0}</Text>
          <Text style={styles.reviewsText}>({item.reviewsCount || 0} reviews)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AxxBiashara</Text>
        <Text style={styles.headerSubtitle}>Kenya Business Directory</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fbbf24" size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredBusinesses}
          renderItem={renderBusinessCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.businessesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No businesses found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1729',
  },
  header: {
    padding: 20,
    backgroundColor: '#1e293b',
    marginBottom: 10,
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
  searchContainer: {
    padding: 15,
    backgroundColor: '#1e293b',
  },
  searchInput: {
    backgroundColor: '#0f1729',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessesList: {
    padding: 15,
  },
  businessCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  businessLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'cover',
    marginRight: 15,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  businessCategory: {
    color: '#fbbf24',
    fontSize: 12,
    marginBottom: 5,
  },
  businessLocation: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 5,
  },
  businessRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 14,
    marginRight: 5,
  },
  reviewsText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
  },
});

export default BusinessScreen;
