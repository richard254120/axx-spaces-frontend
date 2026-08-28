import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  FlatList,
  ActivityIndicator 
} from 'react-native';
import { propertyAPI } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProperties();
  }, []);

  const loadFeaturedProperties = async () => {
    try {
      const data = await propertyAPI.getProperties({ limit: 6, featured: true });
      setFeaturedProperties(data.properties || []);
    } catch (error) {
      console.error('Error loading featured properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 1, name: 'Apartments', icon: '🏢', screen: 'Properties' },
    { id: 2, name: 'Hostels', icon: '🏨', screen: 'Properties' },
    { id: 3, name: 'Tourism', icon: '✈️', screen: 'Tourism' },
    { id: 4, name: 'Business', icon: '💼', screen: 'Business' },
    { id: 5, name: 'Materials', icon: '🔨', screen: 'Materials' },
    { id: 6, name: 'Movers', icon: '🚚', screen: 'Movers' },
  ];

  const renderPropertyCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.propertyCard}
      onPress={() => navigation.navigate('PropertyDetail', { id: item._id })}
    >
      <Image 
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300' }} 
        style={styles.propertyImage}
      />
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.propertyLocation} numberOfLines={1}>
          {item.location}
        </Text>
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

  const renderCategory = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => navigation.navigate(item.screen)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AXX SPACES</Text>
        <Text style={styles.headerSubtitle}>Find your perfect space in Kenya</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={styles.categoryGrid}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Properties</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Properties')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ActivityIndicator color="#fbbf24" size="large" />
        ) : (
          <FlatList
            data={featuredProperties}
            renderItem={renderPropertyCard}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.propertiesList}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Properties')}
        >
          <Text style={styles.actionButtonText}>Browse All Properties</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Tourism')}
        >
          <Text style={styles.actionButtonText}>Explore Tourism</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#fbbf24',
    fontSize: 14,
  },
  categoryGrid: {
    gap: 15,
  },
  categoryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    margin: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  propertiesList: {
    gap: 15,
  },
  propertyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    width: 280,
    borderWidth: 1,
    borderColor: '#334155',
  },
  propertyImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  propertyInfo: {
    padding: 15,
  },
  propertyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  propertyLocation: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 10,
  },
  propertyPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  propertyPrice: {
    color: '#fbbf24',
    fontSize: 18,
    fontWeight: 'bold',
  },
  propertyPeriod: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 5,
  },
  actionButton: {
    backgroundColor: '#fbbf24',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#0f1729',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
