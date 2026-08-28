import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import { CONFIG } from '../config';

export const cameraService = {
  // Request camera permissions
  async requestCameraPermissions() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  },

  // Request gallery permissions
  async requestGalleryPermissions() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  },

  // Take photo with camera
  async takePhoto() {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission not granted');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return {
        uri: result.assets[0].uri,
        type: result.assets[0].type || 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      };
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  },

  // Pick image from gallery
  async pickFromGallery(multiple = false) {
    try {
      const hasPermission = await this.requestGalleryPermissions();
      if (!hasPermission) {
        throw new Error('Gallery permission not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: multiple,
        allowsEditing: !multiple,
        aspect: multiple ? undefined : [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return [];
      }

      return result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `photo_${Date.now()}.jpg`,
      }));
    } catch (error) {
      console.error('Error picking from gallery:', error);
      throw error;
    }
  },

  // Validate image size
  validateImageSize(fileInfo) {
    // This would need to be implemented with actual file size checking
    // For now, we'll assume it passes validation
    return true;
  },

  // Validate image type
  validateImageType(type) {
    return CONFIG.UPLOAD.ALLOWED_IMAGE_TYPES.includes(type);
  },

  // Compress image (placeholder - would need actual implementation)
  async compressImage(uri, quality = 0.8) {
    // This would use a library like react-native-image-resizer
    // For now, return the original URI
    return uri;
  },
};

export default cameraService;
