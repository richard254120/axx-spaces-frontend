import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  ActivityIndicator 
} from 'react-native';
import { userAPI } from '../services/api';

const SavedScreen = ({ navigation }) => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', name: 'All' },
    { id: 'properties', name: 'Properties' },
    { id: 'tourism', name: 'Tourism' },
    { id: 'business', name: 'Business' },
  ];

  useEffect(() => {
    loadSavedItems();
  }, [selectedFilter]);

  const loadSavedItems = async () => {
    try {
      const data = await userAPI.getFavorites();
      let items = data.favorites || [];
      
      if (selectedFilter !== 'all') {
        items = items.filter(item => item.itemType === selectedFilter);
      }
      
      setSavedItems(items);
    } catch (error) {
      console.error('Error loading saved items:', error);
      // Mock data for now
      setSavedItems([
        {
          id: 1,
          itemType: 'property',
          title: 'Modern Apartment in Westlands',
          location: 'Westlands, Nairobi',
          price: 45000,
          priceType: 'monthly',
          image: 'https://via.placeholder.com/300',
        },
        {
          id: 2,
          itemType: 'tourism',
          title: 'Safari Lodge Experience',
          location: 'Maasai Mara',
          price: 15000,
          priceType: 'per night',
          image: 'https://via.placeholder.com/300',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderSavedItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.savedCard}
      onPress={() => {
        if (item.itemType === 'property') {
          navigation.navigate('PropertyDetail', { id: item.itemId });
        } else if (item.itemType === 'tourism') {
          navigation.navigate('TourismDetail', { id: item.itemId });
        } else if (item.itemType === 'business') {
          navigation.navigate('BusinessDetail', { id: item.itemId });
        }
      }}
    >
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/300' }} 
        style={styles.savedImage}
      />
      <View style={styles.savedBadge}>
        <Text style={styles.badgeText}>{item.itemType}</Text>
      </View>
      <View style={styles.savedInfo}>
        <Text style={styles.savedTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.savedLocation} numberOfLines={1}>
          📍 {item.location}
        </Text>
        <View style={styles.savedPriceContainer}>
          <Text style={styles.savedPrice}>
            KES {item.price?.toLocaleString()}
          </Text>
          <Text style={styles.savedPeriod}>
            {item.priceType === 'monthly' ? '/month' : item.priceType === 'per night' ? '/night' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterButton,
        selectedFilter === filter.id && styles.activeFilterButton
      ]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter.id && styles.activeFilterButtonText
      ]}>
        {filter.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#fbbf24" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Items</Text>
        <Text style={styles.headerSubtitle}>Your favorites collection</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map(renderFilterButton)}
      </ScrollView>

      <FlatList
        data={savedItems}
        renderItem={renderSavedItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.savedList}
        numColumns={2}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved items yet</Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => navigation.navigate('Properties')}
            >
              <Text style={styles.browseButtonText}>Browse Properties</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  filtersContainer: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filtersContent: {
    gap: 10,
  },
  filterButton: {
    backgroundColor: '#0f1729',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeFilterButton: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  filterButtonText: {
    color: '#94a3b8',
    fontSize: 14,
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
  savedList: {
    padding: 15,
    gap: 15,
  },
  savedCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    margin: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  savedImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  savedBadge: {
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
  savedInfo: {
    padding: 12,
  },
  savedTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  savedLocation: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  savedPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  savedPrice: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savedPeriod: {
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
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: '#fbbf24',
    borderRadius: 8,
    padding: 15,
    minWidth: 200,
  },
  browseButtonText: {
    color: '#0f1729',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SavedScreen;
