import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'landlord',
    county: '',
    company: '',
    description: '',
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedPhotos = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `photo_${Date.now()}.jpg`,
        }));
        setPhotos([...photos, ...selectedPhotos]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register({ ...formData, photos });
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Registration successful! Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } else {
      Alert.alert('Registration Failed', result.error);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join AXX Spaces today</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#94a3b8"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#94a3b8"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              secureTextEntry
            />

            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[styles.roleButton, formData.role === 'landlord' && styles.activeRole]}
                onPress={() => updateFormData('role', 'landlord')}
              >
                <Text style={[styles.roleText, formData.role === 'landlord' && styles.activeRoleText]}>
                  Landlord
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, formData.role === 'tenant' && styles.activeRole]}
                onPress={() => updateFormData('role', 'tenant')}
              >
                <Text style={[styles.roleText, formData.role === 'tenant' && styles.activeRoleText]}>
                  Tenant
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, formData.role === 'mover' && styles.activeRole]}
                onPress={() => updateFormData('role', 'mover')}
              >
                <Text style={[styles.roleText, formData.role === 'mover' && styles.activeRoleText]}>
                  Mover
                </Text>
              </TouchableOpacity>
            </View>

            {formData.role === 'mover' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="County/Location"
                  placeholderTextColor="#94a3b8"
                  value={formData.county}
                  onChangeText={(text) => updateFormData('county', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Company Name"
                  placeholderTextColor="#94a3b8"
                  value={formData.company}
                  onChangeText={(text) => updateFormData('company', text)}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description of services"
                  placeholderTextColor="#94a3b8"
                  value={formData.description}
                  onChangeText={(text) => updateFormData('description', text)}
                  multiline
                  numberOfLines={4}
                />

                <TouchableOpacity style={styles.photoButton} onPress={handleImagePick}>
                  <Text style={styles.photoButtonText}>
                    {photos.length > 0 ? `${photos.length} Photos Selected` : 'Add Work Photos'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0f1729" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1729',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  activeRole: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  roleText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeRoleText: {
    color: '#0f1729',
  },
  photoButton: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  photoButtonText: {
    color: '#fbbf24',
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: '#fbbf24',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  registerButtonText: {
    color: '#0f1729',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    alignItems: 'center',
    padding: 10,
  },
  loginButtonText: {
    color: '#fbbf24',
    fontSize: 14,
  },
});

export default RegisterScreen;
