@echo off
REM =====================================================================
REM  Mushaf Al-Murajaa - Debug APK builder (corrected paths)
REM  Run this on a machine that has JDK 21 + Android SDK (compileSdk 36).
REM  Edit JAVA_HOME / ANDROID_HOME below to match YOUR install if needed.
REM =====================================================================

REM --- 1) Toolchain locations (EDIT THESE IF YOUR PATHS DIFFER) ---
set "JAVA_HOME=C:\Android\jdk-21.0.11+10"
set "ANDROID_HOME=C:\Android\Sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"

REM --- 2) Project location (this folder) ---
set "PROJECT_DIR=%~dp0"
set "ANDROID_DIR=%PROJECT_DIR%android"

echo Using JAVA_HOME=%JAVA_HOME%
echo Using ANDROID_HOME=%ANDROID_HOME%
echo Android project: %ANDROID_DIR%

REM --- 3) Tell Gradle where the SDK is (local.properties) ---
> "%ANDROID_DIR%\local.properties" echo sdk.dir=%ANDROID_HOME:\=\\%

REM --- 4) Build the debug APK ---
cd /d "%ANDROID_DIR%"
call gradlew.bat assembleDebug --no-daemon

echo.
echo ============================================================
echo  APK output:
echo  %ANDROID_DIR%\app\build\outputs\apk\debug\app-debug.apk
echo ============================================================
