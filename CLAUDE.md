# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

DosisCare is a React Native 0.86.2 app, currently at the bootstrapped-template stage (`@react-native-community/cli` new-app-screen scaffold). `App.tsx` is still close to the generated starter — there is no custom navigation, state management, or feature code yet. Bundle/app identifiers: iOS scheme/target `DosisCare`, Android `applicationId`/`namespace` `com.dosiscare`.

## Commands

- `npm start` — start the Metro bundler (must be running before `npm run android`/`npm run ios`, or launch it in a separate terminal)
- `npm run android` — build and run on Android (emulator or connected device)
- `npm run ios` — build and run on iOS (simulator or connected device)
- `npm test` — run Jest tests (`__tests__/`)
- `npx jest <path>` or `npx jest -t "<test name>"` — run a single test file / test case
- `npm run lint` — ESLint via `@react-native/eslint-config`

TypeScript type-checking has no dedicated script; run `npx tsc --noEmit` directly.

### iOS-specific setup

CocoaPods deps aren't installed by `npm install`. First time / after native dep changes:
```sh
bundle install          # once, installs CocoaPods itself via the Gemfile
bundle exec pod install # from ios/, after any native dependency change
```

## Architecture

- Entry point: [index.js](index.js) registers `App` (from [App.tsx](App.tsx)) as the root component under the name in [app.json](app.json).
- [App.tsx](App.tsx) wraps the app in `SafeAreaProvider` (react-native-safe-area-context) and reads `useColorScheme()` to drive `StatusBar` style — follow this pattern (safe-area + color-scheme awareness) when adding new top-level UI rather than introducing a second provider tree.
- Native projects live in `android/` (Kotlin `MainActivity`/`MainApplication`, Gradle) and `ios/` (Swift `AppDelegate`, CocoaPods) — standard RN CLI layout, not Expo.
- Config: `babel.config.js` uses `@react-native/babel-preset`; `metro.config.js` uses the default `@react-native/metro-config` merged with an (currently empty) override object; `jest.config.js` uses `@react-native/jest-preset`; `tsconfig.json` extends `@react-native/typescript-config`.
