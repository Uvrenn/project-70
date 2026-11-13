# Project 70 for Android

This folder contains a native Android WebView shell for the Project 70 tracker.

## What the Android app adds
- A launcher icon and standalone Android app window.
- Bundled copies of the current web tracker, so the core interface works offline.
- Persistent WebView local storage for the user's logs on that device.
- Native Android notification permission handling.
- Daily workout, meal and recovery reminders scheduled by Android, including after the app is closed. Android may defer inexact alarms for battery management.
- Reminder settings are restored after a device reboot.

## Build
The GitHub Actions workflow copies the root web app into the Android assets folder and builds a debug APK.

The resulting APK is debug-signed for personal testing and direct installation. It is not a Play Store release or a production signing configuration.

## Install
1. Open the latest Android build from the repository's Releases page.
2. Download `Project70-android-debug.apk`.
3. Open the APK on the Android device and follow Android's install prompts.
4. Open Project 70 and allow notifications when prompted if daily notifications are wanted.

The APK keeps app data in that Android installation. Browser/PWA data is not automatically imported. Use the web app's Export My Data feature to keep a backup.
