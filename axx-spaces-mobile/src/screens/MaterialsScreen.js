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
import { materialsAPI } from '../services/api';

const MaterialsScreen = ({ navigation }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialsAPI.getMaterials();
      setMaterials(data.materials || []);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        material.name?.toLowerCase().includes(query) ||
        material.category?.toLowerCase().includes(query) ||
        material.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const renderMaterialCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.materialCard}
      onPress={() => navigation.navigate('MaterialDetail', { id: item._id })}
    >
      <Image 
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300' }} 
        style={styles.materialImage}
      />
      <View style={styles.materialInfo}>
        <Text style={styles.materialName}>{item.name}</Text>
        <Text style={styles.materialCategory}>{item.category}</Text>
        <Text style={styles.materialLocation}>📍 {item.location}</Text>
        <View style={styles.materialPriceContainer}>
          <Text style={styles.materialPrice}>
            KES {item.price?.toLocaleString()}
          </Text>
          <Text style={styles.materialUnit}>
            /{item.unit || 'unit'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Materials Marketplace</Text>
        <Text style={styles.headerSubtitle}>Construction materials & supplies</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search materials..."
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
          data={filteredMaterials}
          renderItem={renderMaterialCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.materialsList}
          numColumns={2}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No materials found</Text>
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
  materialsList: {
    padding: 15,
    gap: 15,
  },
  materialCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    margin: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  materialImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  materialInfo: {
    padding: 12,
  },
  materialName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  materialCategory: {
    color: '#fbbf24',
    fontSize: 12,
    marginBottom: 5,
  },
  materialLocation: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 8,
  },
  materialPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  materialPrice: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  materialUnit: {
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

export default MaterialsScreen;
