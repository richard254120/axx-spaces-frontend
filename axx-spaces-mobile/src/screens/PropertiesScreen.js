import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { propertyAPI } from '../services/api';

const PropertiesScreen = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    propertyType: 'all',
    priceRange: 'all',
    location: 'all',
  });

  useEffect(() => {
    loadProperties();
  }, [filters]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.propertyType !== 'all') {
        params.propertyType = filters.propertyType;
      }
      if (filters.location !== 'all') {
        params.location = filters.location;
      }
      
      const data = await propertyAPI.getProperties(params);
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        property.title?.toLowerCase().includes(query) ||
        property.location?.toLowerCase().includes(query) ||
        property.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const renderPropertyCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.propertyCard}
      onPress={() => navigation.navigate('PropertyDetail', { id: item._id })}
    >
      <Image 
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300' }} 
        style={styles.propertyImage}
      />
      <View style={styles.propertyBadge}>
        <Text style={styles.badgeText}>{item.propertyType || 'Apartment'}</Text>
      </View>
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.propertyLocation} numberOfLines={1}>
          📍 {item.location}
        </Text>
        <View style={styles.propertyDetails}>
          <Text style={styles.propertyDetail}>🛏️ {item.bedrooms || 0} Beds</Text>
          <Text style={styles.propertyDetail}>🚿 {item.bathrooms || 0} Baths</Text>
          <Text style={styles.propertyDetail}>📐 {item.size || 0} sqft</Text>
        </View>
        <View style={styles.propertyPriceContainer}>
          <Text style={styles.propertyPrice}>
            KES {item.price?.toLocaleString()}
          </Text>
          <Text style={styles.propertyPeriod}>
            {item.priceType === 'monthly' ? '/month' : item.priceType === 'daily' ? '/day' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (title, value, category) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filters[category] === value && styles.activeFilterButton
      ]}
      onPress={() => setFilters(prev => ({ ...prev, [category]: value }))}
    >
      <Text style={[
        styles.filterButtonText,
        filters[category] === value && styles.activeFilterButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search properties..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Type:</Text>
          {renderFilterButton('All', 'all', 'propertyType')}
          {renderFilterButton('Apartment', 'apartment', 'propertyType')}
          {renderFilterButton('Hostel', 'hostel', 'propertyType')}
          {renderFilterButton('House', 'house', 'propertyType')}
        </View>
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fbbf24" size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          renderItem={renderPropertyCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.propertiesList}
          numColumns={2}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No properties found</Text>
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
  filtersContainer: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButton: {
    backgroundColor: '#0f1729',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeFilterButton: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  filterButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: '#0f1729',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertiesList: {
    padding: 15,
    gap: 15,
  },
  propertyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    margin: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  propertyImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  propertyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#0f1729',
    fontSize: 10,
    fontWeight: 'bold',
  },
  propertyInfo: {
    padding: 12,
  },
  propertyTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  propertyLocation: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  propertyDetail: {
    color: '#94a3b8',
    fontSize: 11,
  },
  propertyPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  propertyPrice: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  propertyPeriod: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 5,
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

export default PropertiesScreen;
