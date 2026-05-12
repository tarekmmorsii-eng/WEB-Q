@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
set "SDKMANAGER=C:\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat"
set "SDK_ROOT=C:\Android\Sdk"

REM Accept licenses
(for /L %%i in (1,1,20) do @echo y) | "%SDKMANAGER%" --sdk_root="%SDK_ROOT%" --licenses

REM Install required packages
echo y | "%SDKMANAGER%" --sdk_root="%SDK_ROOT%" "platform-tools" "platforms;android-36" "build-tools;36.0.0"

echo SDK_INSTALL_DONE > "c:\antigravity\X3 8app Q\sdk_install_done.txt"