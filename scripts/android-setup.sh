#!/usr/bin/env bash
# Run once after `npx tauri android init`: adds the Java half of Android's certificate check
# (rustls-platform-verifier), which the server link and peer-to-peer need for secure connections.
set -euo pipefail
cd "$(dirname "$0")/../src-tauri"
version=$(grep -A1 '^name = "rustls-platform-verifier-android"$' Cargo.lock | sed -n 's/^version = "\(.*\)"/\1/p')
[ -n "$version" ] || { echo "rustls-platform-verifier-android not in Cargo.lock" >&2; exit 1; }
app=gen/android/app
grep -q rustls-platform-verifier "$app/build.gradle.kts" && { echo "Already set up."; exit 0; }
cat >> "$app/build.gradle.kts" <<GRADLE

// Added by scripts/android-setup.sh: must be the same version as rustls-platform-verifier-android in Cargo.lock.
repositories {
    maven { url = uri("https://github.com/rustls/rustls-platform-verifier/raw/maven-archive/android-release-support/maven/") }
}
dependencies {
    implementation("org.rustls:rustls-platform-verifier:$version")
}
GRADLE
# Called from Rust through JNI only, so a release build's shrinker would remove it.
echo '-keep, includedescriptorclasses class org.rustls.platformverifier.** { *; }' >> "$app/proguard-rules.pro"
echo "Added rustls-platform-verifier $version to the Android build."
