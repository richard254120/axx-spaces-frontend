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
import { moversAPI } from '../services/api';

const MoversScreen = ({ navigation }) => {
  const [movers, setMovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMovers();
  }, []);

  const loadMovers = async () => {
    try {
      setLoading(true);
      const data = await moversAPI.getMovers();
      setMovers(data.movers || []);
    } catch (error) {
      console.error('Error loading movers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovers = movers.filter(mover => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        mover.name?.toLowerCase().includes(query) ||
        mover.company?.toLowerCase().includes(query) ||
        mover.county?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const renderMoverCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.moverCard}
      onPress={() => navigation.navigate('MoverDetail', { id: item._id })}
    >
      <Image 
        source={{ uri: item.workPhotos?.[0] || 'https://via.placeholder.com/100' }} 
        style={styles.moverImage}
      />
      <View style={styles.moverInfo}>
        <Text style={styles.moverName}>{item.name}</Text>
        <Text style={styles.moverCompany}>{item.company}</Text>
        <Text style={styles.moverLocation}>📍 {item.county}</Text>
        <View style={styles.moverDetails}>
          <Text style={styles.moverDetail}>⭐ {item.rating || 4.0}</Text>
          <Text style={styles.moverDetail}>🚚 {item.vehicleType || 'Various'}</Text>
        </View>
        <View style={styles.moverPriceContainer}>
          <Text style={styles.moverPrice}>
            KES {item.pricing?.baseRate?.toLocaleString() || 'Contact'}
          </Text>
          <Text style={styles.moverRateType}>
            {item.pricing?.rateType === 'per_job' ? '/job' : item.pricing?.rateType === 'per_hour' ? '/hour' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Professional Movers</Text>
        <Text style={styles.headerSubtitle}>Reliable moving services in Kenya</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search movers..."
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
          data={filteredMovers}
          renderItem={renderMoverCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.moversList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No movers found</Text>
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
  moversList: {
    padding: 15,
  },
  moverCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  moverImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
    marginRight: 15,
  },
  moverInfo: {
    flex: 1,
  },
  moverName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  moverCompany: {
    color: '#fbbf24',
    fontSize: 12,
    marginBottom: 5,
  },
  moverLocation: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  moverDetails: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  moverDetail: {
    color: '#94a3b8',
    fontSize: 11,
  },
  moverPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  moverPrice: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  moverRateType: {
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

export default MoversScreen;
