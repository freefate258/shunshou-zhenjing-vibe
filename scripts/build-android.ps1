$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$env:JAVA_HOME = (Resolve-Path (Join-Path $projectRoot '.toolchain\jdk\jdk-21.0.13+9')).Path
$env:ANDROID_HOME = (Resolve-Path (Join-Path $projectRoot '.toolchain\android-sdk')).Path
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:ANDROID_USER_HOME = (Resolve-Path (Join-Path $projectRoot '.toolchain\android-user')).Path
$env:GRADLE_USER_HOME = (New-Item -ItemType Directory -Force (Join-Path $projectRoot '.toolchain\gradle')).FullName
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

Push-Location $projectRoot
try {
    npm run assets
    if ($LASTEXITCODE -ne 0) { throw '图标生成失败' }
    npm run android:sync
    if ($LASTEXITCODE -ne 0) { throw 'Android 工程同步失败' }
    & (Join-Path $projectRoot 'android\gradlew.bat') -p (Join-Path $projectRoot 'android') assembleDebug --no-daemon --console=plain
    if ($LASTEXITCODE -ne 0) { throw 'APK 编译失败' }
    $apk = Join-Path $projectRoot 'android\app\build\outputs\apk\debug\app-debug.apk'
    if (-not (Test-Path -LiteralPath $apk)) { throw '没有找到生成的 APK' }
    $releaseDir = Join-Path $projectRoot 'releases\当前版本'
    New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
    $output = Join-Path $releaseDir '顺手真经vibe.apk'
    Copy-Item -LiteralPath $apk -Destination $output -Force
    Write-Output "APK: $output"
}
finally {
    Pop-Location
}
