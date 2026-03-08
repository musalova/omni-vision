# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /Users/sasha/Library/Android/sdk/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools-proguard.html

# Add any project specific keep rules here:

# If your project uses WebView with JS, you might need these:
-keepclassmembers class fqcn.of.javascript.interface.for.webview {
   public *;
}

# Keep the WebView bridge methods if you add any later
-keepattributes EnclosingMethod
-keepattributes InnerClasses
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.example.omnivisionremote.MainActivity$* {
    *;
}
