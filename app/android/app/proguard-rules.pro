# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor's JS<->native bridge relies on @JavascriptInterface-annotated
# methods being callable by name from the WebView's JS side — R8 must not
# rename/strip them (minifyEnabled was turned on in build.gradle; without
# this the bridge silently breaks in release builds only, since debug
# builds don't run R8).
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.getcapacitor.** { *; }

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile
