#!/usr/bin/env node

/**
 * APK Build Script for AXX Spaces Mobile
 * This script helps build Android APK for website distribution
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting AXX Spaces Mobile APK Build Process...\n');

// Configuration
const CONFIG = {
  outputDir: './builds',
  version: require('./package.json').version,
  appName: 'AXX Spaces',
  package: 'com.axxspaces.mobile',
};

// Create output directory
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  console.log(`✅ Created output directory: ${CONFIG.outputDir}`);
}

try {
  console.log('📱 Building Android APK...');
  
  // Build using Expo EAS
  const buildCommand = `eas build --platform android --profile preview --non-interactive`;
  
  console.log(`Running: ${buildCommand}`);
  execSync(buildCommand, { stdio: 'inherit' });
  
  console.log('\n✅ APK build completed successfully!');
  console.log(`📦 Build artifacts will be available in your Expo dashboard`);
  console.log(`🔗 Download from: https://expo.dev/accounts/[your-account]/projects/axx-spaces/builds`);
  
  console.log('\n📋 Next Steps:');
  console.log('1. Download the APK from Expo dashboard');
  console.log('2. Place it in the ./builds directory');
  console.log('3. Update the download page with the new version');
  console.log('4. Test the APK installation');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
