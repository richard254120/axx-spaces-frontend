# AXX Spaces Mobile - Deployment Guide

This guide covers the deployment process for the AXX Spaces mobile app to both iOS App Store and Google Play Store.

## Prerequisites

- Apple Developer Account ($99/year)
- Google Play Developer Account ($25 one-time)
- Expo CLI installed
- EAS CLI installed: `npm install -g eas-cli`

## Initial Setup

### 1. Configure Expo Project

```bash
# Login to Expo
eas login

# Configure your project
eas build:configure
```

### 2. Update app.json

Ensure your `app.json` has the correct configuration:

```json
{
  "expo": {
    "name": "AXX Spaces",
    "slug": "axx-spaces",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.axxspaces.mobile",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.axxspaces.mobile",
      "versionCode": 1
    }
  }
}
```

## iOS Deployment

### 1. Apple Developer Setup

1. **Create App ID in Apple Developer Portal**
   - Go to [Apple Developer](https://developer.apple.com/account/)
   - Navigate to Certificates, Identifiers & Profiles
   - Create a new App ID with bundle identifier `com.axxspaces.mobile`

2. **Configure Provisioning Profiles**
   - Create Development Provisioning Profile
   - Create Distribution Provisioning Profile

3. **Update eas.json**

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "YOUR_APP_STORE_APP_ID",
        "appleTeamId": "YOUR_APPLE_TEAM_ID"
      }
    }
  }
}
```

### 2. Build for iOS

```bash
# Development build
eas build --platform ios --profile development

# Preview build
eas build --platform ios --profile preview

# Production build
eas build --platform ios --profile production
```

### 3. Submit to App Store

```bash
eas submit --platform ios --profile production
```

### 4. App Store Connect Setup

1. **Create App Record**
   - Go to [App Store Connect](https://appstoreconnect.apple.com/)
   - Create a new app
   - Fill in app information
   - Upload build from EAS

2. **Configure App Information**
   - App name: "AXX Spaces"
   - Category: Real Estate or Business
   - Age rating: 12+
   - Privacy policy URL
   - Support URL

3. **Upload Screenshots**
   - 6.5" display: 1242 x 2688 pixels
   - 5.5" display: 1242 x 2208 pixels
   - iPad Pro: 2048 x 2732 pixels

4. **Submit for Review**
   - Complete all required fields
   - Submit for App Store review
   - Wait for approval (typically 1-3 days)

## Android Deployment

### 1. Google Play Setup

1. **Create Google Service Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google Play Android Developer API
   - Create service account
   - Download JSON key file

2. **Grant Permissions**
   - Go to [Google Play Console](https://play.google.com/console)
   - Setup → API access
   - Grant service account permissions
   - Link service account

3. **Update eas.json**

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

### 2. Build for Android

```bash
# Development build
eas build --platform android --profile development

# Preview build
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production
```

### 3. Submit to Google Play

```bash
eas submit --platform android --profile production
```

### 4. Google Play Console Setup

1. **Create App**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create a new app
   - Fill in app details

2. **Store Listing**
   - App name: "AXX Spaces"
   - Short description (80 characters)
   - Full description (4000 characters)
   - Screenshots (at least 2)
   - Feature graphic (1024 x 500 pixels)
   - App icon (512 x 512 pixels)

3. **Content Rating**
   - Complete content rating questionnaire
   - Get rating certificate

4. **Pricing & Distribution**
   - Set price (Free or Paid)
   - Select distribution countries
   - Configure content guidelines

5. **Release Management**
   - Upload APK/AAB from EAS
   - Create release (Internal, Closed, Open, or Production)
   - Submit for review
   - Wait for approval (typically 1-3 days)

## Post-Deployment

### 1. Monitor Performance

- Use Expo Analytics for crash reporting
- Monitor app performance in App Store Connect
- Track user engagement in Google Play Console

### 2. Update Management

- Increment version numbers in `app.json`
- Test thoroughly before each release
- Use staged rollouts for major updates

### 3. User Support

- Set up support email/channel
- Monitor reviews and feedback
- Respond to user issues promptly

## Troubleshooting

### iOS Build Issues

**Error: "No matching provisioning profiles found"**
- Check bundle identifier matches Apple Developer
- Verify provisioning profiles are correct
- Ensure Apple Developer account is active

**Error: "Code signing error"**
- Reset iOS credentials: `eas credentials --reset`
- Rebuild with fresh credentials

### Android Build Issues

**Error: "Keystore file not found"**
- Generate new keystore: `keytool -genkey`
- Update eas.json with keystore path
- Ensure keystore password is correct

**Error: "Google Play API access"**
- Verify service account has correct permissions
- Check API access in Google Play Console
- Ensure JSON key file is valid

## Security Considerations

1. **API Keys**
   - Never commit API keys to version control
   - Use environment variables for sensitive data
   - Rotate keys regularly

2. **Code Signing**
   - Keep signing certificates secure
   - Use different credentials for dev/prod
   - Backup signing certificates

3. **Data Protection**
   - Enable App Transport Security (iOS)
   - Use network security config (Android)
   - Implement proper encryption

## Maintenance

### Regular Updates

- Update dependencies monthly
- Monitor for security vulnerabilities
- Test on new OS versions
- Update app store listings

### Backup Strategy

- Keep backups of signing certificates
- Store keystore files securely
- Document build configurations
- Maintain version history

## Support Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Google Play Developer Documentation](https://developer.android.com/google-play)
