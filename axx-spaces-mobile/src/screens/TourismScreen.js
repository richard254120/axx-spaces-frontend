import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { tourismAPI } from '../services/api';

const TourismScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'hotels', name: 'Hotels' },
    { id: 'lodges', name: 'Lodges' },
    { id: 'safaris', name: 'Safaris' },
    { id: 'adventures', name: 'Adventures' },
    { id: 'cultural', name: 'Cultural' },
  ];

  useEffect(() => {
    loadTourismListings();
  }, [selectedCategory]);

  const loadTourismListings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      const data = await tourismAPI.getListings(params);
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error loading tourism listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderListingCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.listingCard}
      onPress={() => navigation.navigate('TourismDetail', { id: item._id })}
    >
      <Image 
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300' }} 
        style={styles.listingImage}
      />
      <View style={styles.listingBadge}>
        <Text style={styles.badgeText}>{item.category || 'Tourism'}</Text>
      </View>
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.listingLocation} numberOfLines={1}>
          📍 {item.location}
        </Text>
        <View style={styles.listingDetails}>
          <Text style={styles.listingDetail}>⭐ {item.rating || 4.5}</Text>
          <Text style={styles.listingDetail}>👥 {item.capacity || 'N/A'}</Text>
        </View>
        <View style={styles.listingPriceContainer}>
          <Text style={styles.listingPrice}>
            KES {item.price?.toLocaleString()}
          </Text>
          <Text style={styles.listingPeriod}>
            {item.priceType === 'per night' ? '/night' : item.priceType === 'per person' ? '/person' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.activeCategoryButton
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category.id && styles.activeCategoryButtonText
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tourism Kenya</Text>
        <Text style={styles.headerSubtitle}>Discover amazing experiences</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(renderCategoryButton)}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fbbf24" size="large" />
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listingsList}
          numColumns={2}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tourism listings found</Text>
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
  categoriesContainer: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoriesContent: {
    gap: 10,
  },
  categoryButton: {
    backgroundColor: '#0f1729',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeCategoryButton: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  categoryButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  activeCategoryButtonText: {
    color: '#0f1729',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingsList: {
    padding: 15,
    gap: 15,
  },
  listingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    margin: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  listingImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  listingBadge: {
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
  listingInfo: {
    padding: 12,
  },
  listingTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  listingLocation: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  listingDetails: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  listingDetail: {
    color: '#94a3b8',
    fontSize: 11,
  },
  listingPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  listingPrice: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listingPeriod: {
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

export default TourismScreen;
