# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# react-native-webview
-keep class com.reactnativecommunity.webview.** { *; }
-keep class com.reactnativecommunity.webview.RNCWebViewManager** { *; }
-keep class com.reactnativecommunity.webview.RNCWebViewModule** { *; }
-keep interface com.reactnativecommunity.webview.** { *; }

# react-native-gesture-handler
-keep class com.swmansion.gesturehandler.** { *; }

# Expo & React Native Core
-keep class com.facebook.react.** { *; }
-keep class expo.modules.** { *; }
-keep class android.webkit.** { *; }


