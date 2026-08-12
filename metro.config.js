const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web backend (wa-sqlite) ships a .wasm binary that Metro must
// treat as an asset (not source) to bundle for the web target.
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './global.css' });
