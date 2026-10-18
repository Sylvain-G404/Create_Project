@echo off
setlocal EnableExtensions
title Generateur de projet
color 0A

:: =====================================================
::  GENERATEUR DE PROJET
:: =====================================================

:: Toujours travailler depuis le dossier du BAT
cd /d "%~dp0"

echo.
echo ==========================================
echo         GENERATEUR DE PROJET
echo ==========================================
echo.

:: =====================================================
::  1. VERIFICATION DE NODE.JS
:: =====================================================

where node >nul 2>&1
if not errorlevel 1 goto :NODE_READY

echo [INFO] Node.js est introuvable.
echo.

choice /C ON /N /M "Installer Node.js LTS automatiquement ? (O/N) "
if errorlevel 2 goto :CANCEL_INSTALL
goto :INSTALL_NODE


:: =====================================================
::  2. ANNULATION DE L'INSTALLATION
:: =====================================================

:CANCEL_INSTALL
echo.
echo Installation annulee.
echo Node.js est necessaire pour continuer.
echo.
pause
exit /b 1


:: =====================================================
::  3. TELECHARGEMENT DE NODE.JS LTS
:: =====================================================

:INSTALL_NODE
color 0B
echo.
echo Recherche de la derniere version LTS officielle...
echo.

:: Architecture Windows
set "NODE_ARCH=x64"

if /i "%PROCESSOR_ARCHITECTURE%"=="ARM64" set "NODE_ARCH=arm64"
if /i "%PROCESSOR_ARCHITEW6432%"=="ARM64" set "NODE_ARCH=arm64"

:: Fichier temporaire unique
set "NODE_INSTALLER=%TEMP%\node_install_%RANDOM%.msi"

:: Recuperer la derniere LTS et telecharger le MSI officiel
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference = 'Stop';" ^
  "try {" ^
  "  $versions = Invoke-RestMethod 'https://nodejs.org/dist/index.json';" ^
  "  $release = $versions | Where-Object { $_.lts -and $_.files -contains ('win-' + '%NODE_ARCH%' + '-msi') } | Select-Object -First 1;" ^
  "  if (-not $release) { throw 'Aucune version LTS compatible trouvee.' };" ^
  "  $version = $release.version;" ^
  "  $url = 'https://nodejs.org/dist/' + $version + '/node-' + $version + '-%NODE_ARCH%.msi';" ^
  "  Write-Host ('Version : ' + $version);" ^
  "  Write-Host ('Architecture : %NODE_ARCH%');" ^
  "  Invoke-WebRequest -Uri $url -OutFile $env:NODE_INSTALLER;" ^
  "  if ((Get-Item $env:NODE_INSTALLER).Length -lt 1000000) { throw 'Fichier telecharge incomplet.' };" ^
  "} catch {" ^
  "  Write-Error $_;" ^
  "  exit 1;" ^
  "}"

if errorlevel 1 goto :DOWNLOAD_ERROR
if not exist "%NODE_INSTALLER%" goto :DOWNLOAD_ERROR

echo.
echo Telechargement termine.
echo.

:: =====================================================
::  4. INSTALLATION
:: =====================================================

echo Installation de Node.js en cours...
echo.

msiexec /i "%NODE_INSTALLER%" /passive /norestart
set "INSTALL_RESULT=%ERRORLEVEL%"

del "%NODE_INSTALLER%" >nul 2>&1

:: 3010 = installation reussie, redemarrage Windows necessaire
if "%INSTALL_RESULT%"=="3010" goto :REBOOT_REQUIRED
if not "%INSTALL_RESULT%"=="0" goto :INSTALL_ERROR

echo.
echo Installation terminee avec succes.
echo.

:: =====================================================
::  5. ACTUALISATION DU PATH ET RELANCE
:: =====================================================

echo Recherche de Node.js apres installation...

:: Emplacement standard pour une installation Windows x64/ARM64
if exist "%ProgramFiles%\nodejs\node.exe" (
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
)

:: Emplacement standard 32 bits, si applicable
if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
    set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
)

:: Verifier que Node.js fonctionne
where node >nul 2>&1
if errorlevel 1 goto :NODE_NOT_FOUND

node -v
echo.
echo Relancement automatique du generateur...
timeout /t 2 >nul

:: Transmettre le PATH actualise au nouveau processus
start "" "%ComSpec%" /d /c "set PATH=%PATH%&& call ""%~f0"""

exit /b 0


:: =====================================================
::  6. ERREURS D'INSTALLATION
:: =====================================================

:DOWNLOAD_ERROR
color 0C
echo.
echo [ERREUR] Telechargement de Node.js impossible.
echo Verifiez votre connexion Internet.
if defined NODE_INSTALLER del "%NODE_INSTALLER%" >nul 2>&1
echo.
pause
exit /b 1

:INSTALL_ERROR
color 0C
echo.
echo [ERREUR] L'installation de Node.js a echoue.
echo Code Windows Installer : %INSTALL_RESULT%
echo.
echo Vous pouvez installer Node.js manuellement :
echo https://nodejs.org/en/download
echo.
pause
exit /b 1

:REBOOT_REQUIRED
color 0E
echo.
echo Node.js est installe, mais Windows demande un redemarrage.
echo Redemarrez Windows puis relancez ce generateur.
echo.
pause
exit /b 0

:NODE_NOT_FOUND
color 0C
echo.
echo [ERREUR] Installation terminee, mais node.exe reste introuvable.
echo Redemarrez votre terminal ou Windows, puis reessayez.
echo.
pause
exit /b 1


:: =====================================================
::  7. EXECUTION DU GENERATEUR
:: =====================================================

:NODE_READY

for /f "delims=" %%V in ('node -v 2^>nul') do set "NODE_VERSION=%%V"

if not defined NODE_VERSION (
    color 0C
    echo [ERREUR] Node.js est detecte mais ne fonctionne pas.
    echo.
    pause
    exit /b 1
)

echo Node.js : %NODE_VERSION%
echo.

:: Verifier le fichier JavaScript
if not exist "%~dp0create-project.js" (
    color 0C
    echo [ERREUR] create-project.js est introuvable.
    echo Dossier attendu : %~dp0
    echo.
    pause
    exit /b 1
)

:: =====================================================
::  8. LANCEMENT DU GENERATEUR
:: =====================================================

echo Lancement du generateur...
echo.

node "%~dp0create-project.js"
set "NODE_RESULT=%ERRORLEVEL%"

echo.

if not "%NODE_RESULT%"=="0" goto :GENERATION_ERROR

color 0A
echo ==========================================
echo       GENERATION TERMINEE
echo ==========================================
echo.
pause
exit /b 0


:GENERATION_ERROR
color 0C
echo [ERREUR] Le generateur a rencontre un probleme.
echo Code de sortie Node.js : %NODE_RESULT%
echo.
pause
exit /b %NODE_RESULT%