$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
Push-Location $taskRoot
try {
    & npm.cmd run build -- --mode tajweed-trial --outDir artifacts/tajweed-native-assets/public *> artifacts/tajweed-trial-web-build.log
    if ($LASTEXITCODE -ne 0) { throw 'Trial web build failed; see artifacts/tajweed-trial-web-build.log' }
    Copy-Item -LiteralPath 'android/app/src/main/assets/capacitor.config.json','android/app/src/main/assets/capacitor.plugins.json' -Destination 'artifacts/tajweed-native-assets'
    $savedGradleHome = $env:GRADLE_USER_HOME
    $savedAndroidHome = $env:ANDROID_USER_HOME
    try {
        $env:GRADLE_USER_HOME = Join-Path $taskRoot '.gradle-user-home'
        $env:ANDROID_USER_HOME = Join-Path $taskRoot '.android-user-home'
        & .\android\gradlew.bat -p android -PtajweedTrial=true assembleBetaRelease --offline *> artifacts/tajweed-beta-build.log
        if ($LASTEXITCODE -ne 0) { throw 'Trial Android build failed; see artifacts/tajweed-beta-build.log' }
    } finally {
        $env:GRADLE_USER_HOME = $savedGradleHome
        $env:ANDROID_USER_HOME = $savedAndroidHome
    }
    Copy-Item -LiteralPath 'android/app/build/outputs/apk/beta/release/app-beta-arm64-v8a-release.apk' -Destination 'APK/mushaf-tajweed-juz1-trial-arm64.apk'
    Write-Output 'APK/mushaf-tajweed-juz1-trial-arm64.apk'
} finally { Pop-Location }
