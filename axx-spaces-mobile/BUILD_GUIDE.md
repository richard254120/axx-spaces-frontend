# AXX Spaces Mobile - APK Build & Deployment Guide

This guide walks you through building the Android APK and deploying it for website download.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Expo account (free at expo.dev)

## Initial Setup

### 1. Install Dependencies

```bash
cd axx-spaces-mobile
npm install
```

### 2. Configure Expo

```bash
# Login to Expo
eas login

# Configure the project
eas build:configure
```

### 3. Update Environment Configuration

Edit `src/config.js` to set your API URL:

```javascript
API_URL: __DEV__ 
  ? 'http://localhost:1001/api' 
  : 'https://your-production-api.com/api',
```

## Building the APK

### Method 1: Using EAS Build (Recommended)

```bash
# Build APK for testing
npm run build:apk

# Build for production
npm run build:android
```

The build will be processed on Expo's servers and you'll receive a download link.

### Method 2: Local Build (Advanced)

```bash
# Install Android dependencies
npm install -g expo-cli

# Prebuild
expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease
```

## Version Management

### Bump Version

```bash
# Bump patch version (1.0.0 -> 1.0.1)
node version-manager.js bump patch "Bug fixes and improvements"

# Bump minor version (1.0.0 -> 1.1.0)
node version-manager.js bump minor "New features added"

# Bump major version (1.0.0 -> 2.0.0)
node version-manager.js bump major "Major update"
```

### Set Specific Version

```bash
node version-manager.js set 1.2.0 "Release notes"
```

### Check Current Version

```bash
node version-manager.js current
```

## Website Deployment

### 1. Place APK in Downloads Directory

```bash
# Create downloads directory if it doesn't exist
mkdir -p ../public/downloads

# Copy built APK to downloads directory
cp axx-spaces-v1.0.0.apk ../public/downloads/
```

### 2. Update Download Page

The download page is automatically configured at `/mobile-app` on your website. Users can:

- Click the download button
- Scan the QR code with their phone
- Get the latest version information

### 3. Update Version Information

When you release a new version:

1. Update the version using the version manager
2. Build the new APK
3. Replace the APK file in the downloads directory
4. The download page will automatically show the new version

## Testing the APK

### 1. Manual Testing

```bash
# Transfer APK to Android device
adb install axx-spaces-v1.0.0.apk

# Or transfer via USB and install manually
```

### 2. Automated Testing

```bash
# Run tests (if configured)
npm test
```

### 3. Test Checklist

- [ ] App installs successfully
- [ ] App launches without crashes
- [ ] User can login/register
- [ ] Core features work (properties, tourism, etc.)
- [ ] Camera functionality works
- [ ] Location services work
- [ ] API calls are successful
- [ ] Offline mode functions properly

## Troubleshooting

### Build Issues

**Problem: Build fails with "No matching provisioning profiles"**
- Solution: Configure EAS build credentials
- Run: `eas credentials --platform android`

**Problem: Build takes too long**
- Solution: Use preview build for faster iteration
- Run: `eas build --platform android --profile preview`

### Installation Issues

**Problem: "Install blocked" message**
- Solution: Enable "Unknown sources" in Android settings
- Settings > Security > Unknown sources

**Problem: App crashes on launch**
- Solution: Check logcat for errors
- Run: `adb logcat`

### API Issues

**Problem: API calls failing**
- Solution: Check API URL configuration
- Verify backend is running
- Check network connectivity

## Security Considerations

### APK Signing

For production, sign your APK:

```bash
# Generate keystore
keytool -genkey -v -keystore axx-spaces.keystore -alias axx-spaces-key -keyalg RSA -keysize 2048 -validity 10000

# Configure signing in eas.json
```

### Code Security

- Never commit API keys
- Use environment variables for sensitive data
- Enable ProGuard/R8 for code obfuscation
- Regular security audits

## Maintenance

### Regular Updates

1. **Check for Expo SDK updates**
   ```bash
   npm list expo
   ```

2. **Update dependencies**
   ```bash
   npm update
   ```

3. **Test on new Android versions**
   - Test on Android 5.0 through latest
   - Check for compatibility issues

### Performance Monitoring

- Monitor app size (keep under 50MB)
- Check crash reports
- Monitor API response times
- Track user engagement

## Automation

### CI/CD Setup

Create `.github/workflows/build.yml`:

```yaml
name: Build APK
on:
  push:
    tags:
      - 'v*'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:apk
```

### Automated Version Bumping

Set up automated version bumping on releases:

```bash
# Install standard-version
npm install -g standard-version

# Bump version and create changelog
standard-version
```

## Support

For issues with:
- **Expo/EAS**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/
- **AXX Spaces**: Check the main README.md

## Next Steps

1. ✅ Complete initial build
2. ✅ Test APK on multiple devices
3. ✅ Deploy to website downloads
4. ✅ Set up user feedback collection
5. ✅ Plan for Play Store submission (optional)
