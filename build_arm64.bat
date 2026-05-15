@echo off
set "JAVA_HOME=C:\Android\jdk-21.0.11+10"
set "ANDROID_HOME=C:\Android\Sdk"
set "ANDROID_SDK_ROOT=C:\Android\Sdk"
cd /d "c:\antigravity\X3 8app Q\android"
call gradlew.bat assembleDebug --no-daemon > "c:\antigravity\X3 8app Q\build_arm64_log.txt" 2>&1
echo BUILD_FINISHED >> "c:\antigravity\X3 8app Q\build_arm64_log.txt"