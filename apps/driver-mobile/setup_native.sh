#!/bin/bash
# =============================================================================
# DAMFlotte CLD - Native Platform Setup Script
# Run this on your MacBook where Flutter SDK is installed
# Usage: cd apps/driver-mobile && chmod +x setup_native.sh && ./setup_native.sh
# =============================================================================
set -e

APP_NAME="dam_driver"
ORG="ci.damflotte.driver"
DESCRIPTION="DAMFlotte CLD - Driver Mobile App"

echo "=============================================="
echo "  DAMFlotte CLD - Native Platform Setup"
echo "=============================================="

# Check Flutter installation
if ! command -v flutter &> /dev/null; then
    echo "ERROR: Flutter not found. Install Flutter SDK first."
    echo "Visit: https://docs.flutter.dev/get-started/install"
    exit 1
fi

echo ""
echo "Flutter version:"
flutter --version
echo ""

# Navigate to driver-mobile directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ---- Step 1: Create native platform directories ----
echo "[1/6] Creating native platform directories..."

# Create a temp project to get native dirs
TEMP_DIR=$(mktemp -d)
flutter create --org "$ORG" --project-name "$APP_NAME" --description "$DESCRIPTION" "$TEMP_DIR/$APP_NAME"

# Copy android and ios directories
if [ ! -d "android" ]; then
    cp -r "$TEMP_DIR/$APP_NAME/android" .
    echo "  -> android/ directory created"
else
    echo "  -> android/ directory already exists, skipping"
fi

if [ ! -d "ios" ]; then
    cp -r "$TEMP_DIR/$APP_NAME/ios" .
    echo "  -> ios/ directory created"
else
    echo "  -> ios/ directory already exists, skipping"
fi

# Copy web and other platform dirs if needed
for platform in web linux macos windows; do
    if [ ! -d "$platform" ] && [ -d "$TEMP_DIR/$APP_NAME/$platform" ]; then
        cp -r "$TEMP_DIR/$APP_NAME/$platform" .
        echo "  -> $platform/ directory created"
    fi
done

rm -rf "$TEMP_DIR"

# ---- Step 2: Configure Android ----
echo ""
echo "[2/6] Configuring Android..."

# Update Android app name and package
ANDROID_MANIFEST="android/app/src/main/AndroidManifest.xml"
if [ -f "$ANDROID_MANIFEST" ]; then
    sed -i.bak 's/android:label="[^"]*"/android:label="DAMFlotte Chauffeur"/' "$ANDROID_MANIFEST"
    rm -f "${ANDROID_MANIFEST}.bak"
    echo "  -> Android manifest updated"
fi

# Update build.gradle with proper config
BUILD_GRADLE="android/app/build.gradle"
if [ -f "$BUILD_GRADLE" ]; then
    # Update applicationId
    sed -i.bak "s/applicationId \".*\"/applicationId \"$ORG\"/" "$BUILD_GRADLE" 2>/dev/null || true
    # Update namespace if it exists
    sed -i.bak "s/namespace \".*\"/namespace \"$ORG\"/" "$BUILD_GRADLE" 2>/dev/null || true
    rm -f "${BUILD_GRADLE}.bak"
    echo "  -> build.gradle updated"
fi

# Check for build.gradle.kts (newer Flutter)
BUILD_GRADLE_KTS="android/app/build.gradle.kts"
if [ -f "$BUILD_GRADLE_KTS" ]; then
    sed -i.bak "s/applicationId = \".*\"/applicationId = \"$ORG\"/" "$BUILD_GRADLE_KTS" 2>/dev/null || true
    sed -i.bak "s/namespace = \".*\"/namespace = \"$ORG\"/" "$BUILD_GRADLE_KTS" 2>/dev/null || true
    rm -f "${BUILD_GRADLE_KTS}.bak"
    echo "  -> build.gradle.kts updated"
fi

# Create key.properties placeholder for signing
if [ ! -f "android/key.properties" ]; then
    cat > "android/key.properties" << 'KEYPROPS'
# Android signing configuration
# Update these values with your actual keystore information
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=upload
storeFile=../keystore/upload-keystore.jks
KEYPROPS
    echo "  -> key.properties template created"
fi

# Create keystore directory
mkdir -p "android/keystore"

# ---- Step 3: Configure iOS ----
echo ""
echo "[3/6] Configuring iOS..."

# Update iOS display name
INFO_PLIST="ios/Runner/Info.plist"
if [ -f "$INFO_PLIST" ]; then
    # Use PlistBuddy to update display name
    /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName 'DAMFlotte Chauffeur'" "$INFO_PLIST" 2>/dev/null || \
    /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string 'DAMFlotte Chauffeur'" "$INFO_PLIST" 2>/dev/null || true
    echo "  -> iOS Info.plist updated"
fi

# ---- Step 4: Install Flutter dependencies ----
echo ""
echo "[4/6] Installing Flutter dependencies..."
flutter pub get
echo "  -> Dependencies installed"

# ---- Step 5: Setup Fastlane ----
echo ""
echo "[5/6] Setting up Fastlane..."

# Check if Fastlane is installed
if ! command -v fastlane &> /dev/null; then
    echo "  Installing Fastlane..."
    if command -v brew &> /dev/null; then
        brew install fastlane
    else
        sudo gem install fastlane -NV
    fi
fi

# Install bundler dependencies if Gemfile exists
if [ -f "Gemfile" ]; then
    bundle install
    echo "  -> Ruby dependencies installed"
fi

echo "  -> Fastlane ready"

# ---- Step 6: Generate Android keystore (if needed) ----
echo ""
echo "[6/6] Checking Android keystore..."

KEYSTORE_PATH="android/keystore/upload-keystore.jks"
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "  No keystore found. Generating upload keystore..."
    echo "  (You'll be prompted for passwords and identity info)"
    echo ""

    keytool -genkey -v \
        -keystore "$KEYSTORE_PATH" \
        -storetype JKS \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -alias upload \
        -dname "CN=DAMFlotte CLD, OU=Mobile, O=NAFFA Global, L=Abidjan, ST=Lagunes, C=CI" \
        -storepass damflotte2024 \
        -keypass damflotte2024 2>/dev/null || {
        echo "  WARNING: Could not auto-generate keystore."
        echo "  Run manually:"
        echo "  keytool -genkey -v -keystore $KEYSTORE_PATH -keyalg RSA -keysize 2048 -validity 10000 -alias upload"
    }

    if [ -f "$KEYSTORE_PATH" ]; then
        # Update key.properties with the generated password
        cat > "android/key.properties" << 'KEYPROPS'
storePassword=damflotte2024
keyPassword=damflotte2024
keyAlias=upload
storeFile=../keystore/upload-keystore.jks
KEYPROPS
        echo "  -> Keystore generated and key.properties updated"
        echo "  IMPORTANT: Change these default passwords before production release!"
    fi
fi

echo ""
echo "=============================================="
echo "  Setup Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "  1. Run: flutter run          (test on device/emulator)"
echo "  2. Run: ./deploy.sh ios      (deploy to TestFlight)"
echo "  3. Run: ./deploy.sh android  (deploy to Play Store)"
echo "  4. Run: ./deploy.sh all      (deploy to both)"
echo ""
echo "For iOS deployment, ensure you have:"
echo "  - Apple Developer account configured in Xcode"
echo "  - App ID created in App Store Connect"
echo "  - Valid provisioning profiles"
echo ""
echo "For Android deployment, ensure you have:"
echo "  - Google Play Console access"
echo "  - Service account JSON key for API access"
echo "  - App created in Google Play Console"
echo ""
