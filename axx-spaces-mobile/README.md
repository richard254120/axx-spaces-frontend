# AXX Spaces Mobile App

A comprehensive React Native mobile application for the AXX Spaces platform - Kenya's premier property rental and business services platform.

## Features

- **Property Rentals**: Browse and rent apartments, hostels, and houses across Kenya
- **Tourism**: Discover hotels, lodges, safaris, and cultural experiences
- **Business Directory**: AxxBiashara - Connect with local businesses
- **Materials Marketplace**: Construction materials and supplies
- **Movers Services**: Professional moving and logistics
- **User Authentication**: Secure login and registration
- **Messaging System**: In-app communication
- **Wallet Integration**: Manage payments and transactions
- **Offline Support**: Cache data for offline access
- **Location Services**: GPS-based property discovery
- **Push Notifications**: Real-time updates and alerts

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development and build platform
- **React Navigation**: Navigation and routing
- **Expo Location**: GPS and location services
- **Expo Camera**: Camera and image handling
- **Expo Notifications**: Push notifications
- **AsyncStorage**: Local data persistence
- **SecureStore**: Secure token storage

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode (macOS only)
- For Android: Android Studio with SDK

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd axx-spaces-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm start
```

5. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
API_URL=http://localhost:1001/api
EXPO_PROJECT_ID=your-expo-project-id
```

### Backend Configuration

Update the API URL in `src/config.js` to point to your backend server:

```javascript
API_URL: __DEV__ 
  ? 'http://localhost:1001/api' 
  : 'https://your-production-api.com/api',
```

## Project Structure

```
axx-spaces-mobile/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/         # React Context providers
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # Screen components
│   ├── services/        # API and utility services
│   ├── utils/           # Helper functions
│   └── config.js        # App configuration
├── assets/              # Images, fonts, etc.
├── App.js              # Main app component
├── package.json        # Dependencies
└── app.json           # Expo configuration
```

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm test` - Run tests
- `npm lint` - Run linter

### Code Style

- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Add comments for complex logic

## Testing

### Manual Testing

1. **Authentication Flow**
   - Test user registration
   - Test login with different roles
   - Test logout functionality

2. **Core Features**
   - Property browsing and search
   - Tourism listings
   - Business directory
   - Materials marketplace
   - Movers services

3. **Mobile-Specific Features**
   - Camera functionality
   - Location services
   - Push notifications
   - Offline mode

### Automated Testing

Setup automated testing with Jest and React Native Testing Library:

```bash
npm install --save-dev jest @testing-library/react-native
```

## Building for Production

### iOS

1. Configure iOS signing in Xcode
2. Update bundle identifier in `app.json`
3. Build with Expo:
```bash
eas build --platform ios
```

### Android

1. Configure Android signing
2. Update package name in `app.json`
3. Build with Expo:
```bash
eas build --platform android
```

## Deployment

### App Store (iOS)

1. Create Apple Developer account
2. Configure App Store Connect
3. Submit build for review
4. Wait for approval

### Google Play (Android)

1. Create Google Play Developer account
2. Configure Play Console
3. Submit signed APK/AAB
4. Wait for review

## Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
npm start -- --reset-cache
```

**iOS build errors:**
```bash
cd ios && pod install
```

**Android build errors:**
```bash
cd android && ./gradlew clean
```

**Network issues:**
- Ensure backend is running
- Check API URL configuration
- Verify network permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@axxspaces.com or open an issue in the repository.

## Roadmap

- [ ] Add biometric authentication
- [ ] Implement real-time chat
- [ ] Add video tours for properties
- [ ] Integrate payment gateways
- [ ] Add AR property viewing
- [ ] Implement referral system
- [ ] Add advanced analytics dashboard
