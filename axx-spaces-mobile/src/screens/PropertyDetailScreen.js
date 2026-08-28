import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Alert,
  Share 
} from 'react-native';
import { propertyAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PropertyDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const data = await propertyAPI.getProperty(id);
      setProperty(data);
      
      // Check if property is in favorites
      if (user) {
        const favorites = await userAPI.getFavorites();
        setIsFavorite(favorites.some(fav => fav.itemId === id && fav.itemType === 'property'));
      }
    } catch (error) {
      console.error('Error loading property:', error);
      Alert.alert('Error', 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to save favorites');
      return;
    }

    try {
      if (isFavorite) {
        await userAPI.removeFavorite(id);
        setIsFavorite(false);
      } else {
        await userAPI.addFavorite(id, 'property');
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this property: ${property.title} - ${property.location}`,
        url: `https://axxspaces.com/properties/${id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleContactLandlord = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to contact the landlord');
      return;
    }
    navigation.navigate('Messages', { propertyId: id, landlordId: property.landlordId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#fbbf24" size="large" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {property.images?.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.propertyImage} />
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
          <Text style={styles.favoriteButtonText}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.location}>📍 {property.location}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>KES {property.price?.toLocaleString()}</Text>
            <Text style={styles.period}>
              {property.priceType === 'monthly' ? '/month' : property.priceType === 'daily' ? '/day' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Bedrooms</Text>
              <Text style={styles.detailValue}>{property.bedrooms || 0}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Bathrooms</Text>
              <Text style={styles.detailValue}>{property.bathrooms || 0}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Size</Text>
              <Text style={styles.detailValue}>{property.size || 0} sqft</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{property.propertyType || 'Apartment'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>

        {property.amenities?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {property.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Text style={styles.amenityText}>✓ {amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.locationText}>{property.location}</Text>
          <Text style={styles.coordinatesText}>
            Lat: {property.coordinates?.lat}, Lng: {property.coordinates?.lng}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Landlord Information</Text>
          <View style={styles.landlordInfo}>
            <Text style={styles.landlordName}>{property.landlordName || 'Property Owner'}</Text>
            <Text style={styles.landlordPhone}>{property.landlordPhone || 'Contact for details'}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactLandlord}>
            <Text style={styles.contactButtonText}>Contact Landlord</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Book Viewing</Text>
          </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  propertyImage: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(15, 23, 41, 0.8)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonText: {
    fontSize: 24,
  },
  shareButton: {
    position: 'absolute',
    top: 20,
    right: 80,
    backgroundColor: 'rgba(15, 23, 41, 0.8)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 24,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  location: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  period: {
    fontSize: 16,
    color: '#94a3b8',
    marginLeft: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  detailItem: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 15,
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 5,
  },
  detailValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    color: '#e2e8f0',
    fontSize: 16,
    lineHeight: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityItem: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  amenityText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  locationText: {
    color: '#e2e8f0',
    fontSize: 16,
    marginBottom: 5,
  },
  coordinatesText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  landlordInfo: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  landlordName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  landlordPhone: {
    color: '#94a3b8',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#fbbf24',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#0f1729',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  bookButtonText: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PropertyDetailScreen;
