// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// expo-sqlite on web runs SQLite as WebAssembly in a worker; see
// https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/#web-setup
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

const previousEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const next = previousEnhanceMiddleware ? previousEnhanceMiddleware(middleware, server) : middleware;
  return (req, res, done) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next(req, res, done);
  };
};

module.exports = config;
