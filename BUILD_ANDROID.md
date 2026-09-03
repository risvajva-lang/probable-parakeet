# HDOFlix Android Build

This project is configured as a React Native Android application.

- Application ID: `com.hdoflix`
- App name: `HDOFlix`
- Version: `2.4.0` / code `1`
- Hermes enabled
- New Architecture disabled for compatibility
- Internet/network permissions enabled
- Debug and release build types configured

Open the project root in Android Studio, or run from the project root after installing dependencies:

```bash
npm install
cd android
./gradlew assembleDebug
```

The APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.

For release:

```bash
cd android
./gradlew assembleRelease
```

A temporary debug signing key is configured for release in this development package. Replace it with a private release keystore before Play Store publishing.
