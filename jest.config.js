/**
 * Jest config for pure-logic unit tests. We bypass the React Native/Expo Babel
 * preset (tested modules are plain TS with no RN runtime) and transform TS/JS
 * with a minimal Babel setup. `@noble/*` ship ESM only, so they're transformed
 * too (not ignored).
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.[jt]s$': [
      'babel-jest',
      {
        configFile: false,
        babelrc: false,
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!(@noble)/)'],
};
