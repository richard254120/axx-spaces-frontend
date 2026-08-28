#!/usr/bin/env node

/**
 * Version Manager for AXX Spaces Mobile
 * Handles version bumping and changelog management
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  packageJsonPath: './package.json',
  appJsonPath: './app.json',
  changelogPath: './CHANGELOG.md',
};

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(CONFIG.packageJsonPath, 'utf8'));
  return packageJson.version;
}

function updateVersion(newVersion) {
  // Update package.json
  const packageJson = JSON.parse(fs.readFileSync(CONFIG.packageJsonPath, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(CONFIG.packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Update app.json
  const appJson = JSON.parse(fs.readFileSync(CONFIG.appJsonPath, 'utf8'));
  appJson.expo.version = newVersion;
  fs.writeFileSync(CONFIG.appJsonPath, JSON.stringify(appJson, null, 2));

  console.log(`✅ Version updated to ${newVersion}`);
}

function bumpVersion(type) {
  const currentVersion = getCurrentVersion();
  const parts = currentVersion.split('.').map(Number);

  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
      parts[2]++;
      break;
    default:
      console.error('Invalid version type. Use: major, minor, or patch');
      process.exit(1);
  }

  const newVersion = parts.join('.');
  updateVersion(newVersion);
  return newVersion;
}

function addToChangelog(version, changes) {
  const timestamp = new Date().toISOString().split('T')[0];
  const changelogEntry = `## [${version}] - ${timestamp}\n\n${changes}\n\n`;
  
  let changelog = '';
  if (fs.existsSync(CONFIG.changelogPath)) {
    changelog = fs.readFileSync(CONFIG.changelogPath, 'utf8');
  }
  
  fs.writeFileSync(CONFIG.changelogPath, changelogEntry + changelog);
  console.log(`✅ Changelog updated for version ${version}`);
}

// CLI interface
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'current':
    console.log(`Current version: ${getCurrentVersion()}`);
    break;
  case 'bump':
    const type = args[0] || 'patch';
    const version = bumpVersion(type);
    if (args[1]) {
      addToChangelog(version, args[1]);
    }
    break;
  case 'set':
    if (!args[0]) {
      console.error('Please provide a version number');
      process.exit(1);
    }
    updateVersion(args[0]);
    if (args[1]) {
      addToChangelog(args[0], args[1]);
    }
    break;
  case 'changelog':
    if (!args[0]) {
      console.error('Please provide changelog content');
      process.exit(1);
    }
    addToChangelog(getCurrentVersion(), args[0]);
    break;
  default:
    console.log('Usage:');
    console.log('  node version-manager.js current              - Show current version');
    console.log('  node version-manager.js bump [type] [notes]  - Bump version (major/minor/patch)');
    console.log('  node version-manager.js set <version> [notes] - Set specific version');
    console.log('  node version-manager.js changelog <notes>    - Add to changelog');
    process.exit(1);
}
