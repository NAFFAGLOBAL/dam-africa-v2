#!/bin/bash
# =============================================================================
# DAMFlotte CLD - Automated Deployment Script
# Deploy to Apple App Store (TestFlight) and/or Google Play Store
#
# Usage:
#   ./deploy.sh ios        Deploy to TestFlight
#   ./deploy.sh android    Deploy to Google Play internal testing
#   ./deploy.sh all        Deploy to both stores
#   ./deploy.sh build      Build only (no upload)
# =============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${BLUE}=============================================="
    echo "  $1"
    echo -e "==============================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# ---- Pre-flight checks ----
preflight() {
    print_header "Pre-flight Checks"

    # Check Flutter
    if ! command -v flutter &> /dev/null; then
        print_error "Flutter not found. Install Flutter SDK first."
        exit 1
    fi
    echo "Flutter: $(flutter --version --machine 2>/dev/null | head -1 || flutter --version 2>&1 | head -1)"

    # Check native directories
    if [ ! -d "android" ] || [ ! -d "ios" ]; then
        print_warning "Native platform directories missing."
        echo "Running setup script..."
        ./setup_native.sh
    fi

    # Check Fastlane
    if ! command -v fastlane &> /dev/null; then
        print_error "Fastlane not found. Install with: brew install fastlane"
        exit 1
    fi
    echo "Fastlane: $(fastlane --version 2>&1 | head -1)"

    # Flutter pub get
    echo ""
    echo "Installing dependencies..."
    flutter pub get

    print_success "Pre-flight checks passed"
}

# ---- Build Only ----
build_all() {
    print_header "Building Release Artifacts"

    echo "Building Android AAB..."
    flutter build appbundle --release
    print_success "Android AAB built"

    echo ""
    echo "Building Android APK..."
    flutter build apk --release
    print_success "Android APK built"

    echo ""
    echo "Building iOS..."
    flutter build ios --release --no-codesign
    print_success "iOS build prepared (signing via Fastlane)"

    echo ""
    echo "Build artifacts:"
    echo "  Android AAB: build/app/outputs/bundle/release/app-release.aab"
    echo "  Android APK: build/app/outputs/flutter-apk/app-release.apk"
    echo "  iOS:         build/ios/iphoneos/Runner.app"
}

# ---- Deploy iOS ----
deploy_ios() {
    print_header "Deploying to Apple App Store (TestFlight)"

    # Check iOS-specific requirements
    if [ ! -d "ios" ]; then
        print_error "ios/ directory not found. Run ./setup_native.sh first."
        exit 1
    fi

    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode command line tools not found."
        echo "Install with: xcode-select --install"
        exit 1
    fi

    # Check for Appfile configuration
    if grep -q "YOUR_TEAM_ID" "ios/fastlane/Appfile" 2>/dev/null; then
        print_warning "iOS Fastlane not configured!"
        echo ""
        echo "Edit ios/fastlane/Appfile with your Apple Developer info:"
        echo "  - apple_id: Your Apple ID email"
        echo "  - team_id: Apple Developer Team ID"
        echo "  - itc_team_id: App Store Connect Team ID"
        echo ""
        echo "Then run this script again."
        exit 1
    fi

    cd ios
    fastlane beta
    cd ..

    print_success "iOS deployed to TestFlight!"
    echo "Check App Store Connect for build status."
}

# ---- Deploy Android ----
deploy_android() {
    print_header "Deploying to Google Play Store (Internal Testing)"

    # Check Android-specific requirements
    if [ ! -d "android" ]; then
        print_error "android/ directory not found. Run ./setup_native.sh first."
        exit 1
    fi

    # Check for service account key
    if [ ! -f "android/fastlane/play-store-key.json" ]; then
        print_warning "Google Play service account key not found!"
        echo ""
        echo "To set up Play Store deployment:"
        echo "  1. Go to Google Play Console > Settings > API access"
        echo "  2. Create a service account or use existing one"
        echo "  3. Download the JSON key file"
        echo "  4. Save it as: android/fastlane/play-store-key.json"
        echo ""
        echo "Alternatively, build APK for manual upload:"
        echo "  flutter build apk --release"
        echo "  # Upload build/app/outputs/flutter-apk/app-release.apk"
        echo ""

        # Still build the APK for manual upload
        echo "Building APK for manual upload..."
        flutter build apk --release
        print_success "APK built at: build/app/outputs/flutter-apk/app-release.apk"
        echo "Upload this APK manually to Google Play Console."
        return
    fi

    # Check for Appfile configuration
    if grep -q "play-store-key.json" "android/fastlane/Appfile" 2>/dev/null; then
        if [ ! -f "android/fastlane/play-store-key.json" ]; then
            print_error "Service account key file missing."
            exit 1
        fi
    fi

    cd android
    fastlane internal
    cd ..

    print_success "Android deployed to Google Play internal testing!"
    echo "Check Google Play Console for release status."
}

# ---- Version bump ----
bump_version() {
    local CURRENT_VERSION=$(grep "^version:" pubspec.yaml | sed 's/version: //')
    local VERSION_NAME=$(echo "$CURRENT_VERSION" | cut -d'+' -f1)
    local BUILD_NUMBER=$(echo "$CURRENT_VERSION" | cut -d'+' -f2)
    local NEW_BUILD=$((BUILD_NUMBER + 1))
    local NEW_VERSION="${VERSION_NAME}+${NEW_BUILD}"

    sed -i.bak "s/^version: .*/version: ${NEW_VERSION}/" pubspec.yaml
    rm -f pubspec.yaml.bak

    echo "Version bumped: $CURRENT_VERSION -> $NEW_VERSION"
}

# ---- Main ----
case "${1:-help}" in
    ios)
        preflight
        deploy_ios
        ;;
    android)
        preflight
        deploy_android
        ;;
    all)
        preflight
        bump_version
        deploy_ios
        deploy_android
        print_header "Deployment Complete"
        print_success "Both iOS and Android deployed!"
        ;;
    build)
        preflight
        build_all
        ;;
    bump)
        bump_version
        ;;
    help|*)
        echo "DAMFlotte CLD - Deployment Script"
        echo ""
        echo "Usage: ./deploy.sh <command>"
        echo ""
        echo "Commands:"
        echo "  ios       Deploy to Apple TestFlight"
        echo "  android   Deploy to Google Play internal testing"
        echo "  all       Deploy to both stores"
        echo "  build     Build release artifacts only"
        echo "  bump      Bump build number"
        echo "  help      Show this help"
        echo ""
        echo "Prerequisites:"
        echo "  - Flutter SDK installed"
        echo "  - Fastlane installed (brew install fastlane)"
        echo "  - Xcode installed (for iOS)"
        echo "  - Android SDK installed (for Android)"
        echo "  - Run ./setup_native.sh first if android/ and ios/ directories don't exist"
        ;;
esac
