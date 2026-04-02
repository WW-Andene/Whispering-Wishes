# Whispering Wishes — Convene History URL Extractor
# Reads your Wuthering Waves game logs to find the Convene History URL.
# The script only reads log files — it does not modify anything.
#
# Usage: Open PowerShell and run:
#   iwr -UseBasicParsing -Headers @{"User-Agent"="Mozilla/5.0"} https://raw.githubusercontent.com/WW-Andene/Whispering-Wishes/main/app/public/import.ps1 | iex

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "  Whispering Wishes — Convene URL Extractor" -ForegroundColor Cyan
Write-Host "  ==========================================" -ForegroundColor DarkGray
Write-Host ""

# ── Find game installation ──────────────────────────────────────────────────

function Find-GamePath {
    # Check registry (MUI Cache, Firewall, Uninstall entries)
    $registryPaths = @(
        "HKCU:\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\MuiCache",
        "HKLM:\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\FirewallRules",
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
    )

    foreach ($regPath in $registryPaths) {
        $items = Get-ItemProperty -Path $regPath 2>$null
        if ($items) {
            $match = ($items | Out-String) -split "`n" | Select-String -Pattern "Wuthering Waves" | Select-Object -First 1
            if ($match) {
                $path = [regex]::Match($match.Line, '([A-Z]:\\[^"]*?Wuthering Waves[^"\\]*)').Value
                if ($path -and (Test-Path $path)) {
                    return $path
                }
            }
        }
    }

    # Search common install locations across all drives
    $commonPaths = @(
        "Wuthering Waves",
        "Wuthering Waves Game",
        "Steam\steamapps\common\Wuthering Waves",
        "SteamLibrary\steamapps\common\Wuthering Waves",
        "Epic Games\WutheringWaves",
        "Epic Games\Wuthering Waves",
        "Games\Wuthering Waves"
    )

    foreach ($drive in [char[]](65..90)) {
        $drivePath = "${drive}:\"
        if (Test-Path $drivePath) {
            foreach ($sub in $commonPaths) {
                $full = Join-Path $drivePath $sub
                if (Test-Path $full) { return $full }
                # Also check Program Files
                $pf = Join-Path "${drivePath}Program Files" $sub
                if (Test-Path $pf) { return $pf }
                $pf86 = Join-Path "${drivePath}Program Files (x86)" $sub
                if (Test-Path $pf86) { return $pf86 }
            }
        }
    }

    return $null
}

$gamePath = Find-GamePath

if (-not $gamePath) {
    Write-Host "  Could not find Wuthering Waves automatically." -ForegroundColor Yellow
    Write-Host "  Please enter your game installation path:" -ForegroundColor Yellow
    Write-Host "  (e.g. D:\Wuthering Waves)" -ForegroundColor DarkGray
    Write-Host ""
    $gamePath = Read-Host "  Path"
    if (-not (Test-Path $gamePath)) {
        Write-Host ""
        Write-Host "  Path not found. Make sure the game is installed." -ForegroundColor Red
        Write-Host ""
        pause
        exit 1
    }
} else {
    Write-Host "  Found game at: $gamePath" -ForegroundColor Green
}

# ── Search log files for convene URL ────────────────────────────────────────

$urlPattern = 'https://aki-gm-resources(-oversea)?\.aki-game\.(net|com)/aki/gacha/index\.html#/record'
$conveneUrl = $null

# Try Client.log first
$clientLog = Join-Path $gamePath "Client\Saved\Logs\Client.log"
if (Test-Path $clientLog) {
    Write-Host "  Scanning Client.log..." -ForegroundColor DarkGray
    $lines = Get-Content $clientLog -Encoding UTF8 2>$null
    foreach ($line in ($lines | Select-Object -Last 500)) {
        if ($line -match "($urlPattern[^\s""']*)") {
            $conveneUrl = $Matches[1]
        }
    }
}

# Try debug.log as fallback
if (-not $conveneUrl) {
    $debugLog = Join-Path $gamePath "Client\Binaries\Win64\ThirdParty\KrPcSdk_Global\KRSDKRes\KRSDKWebView\debug.log"
    if (Test-Path $debugLog) {
        Write-Host "  Scanning debug.log..." -ForegroundColor DarkGray
        $lines = Get-Content $debugLog -Encoding UTF8 2>$null
        foreach ($line in ($lines | Select-Object -Last 500)) {
            if ($line -match '"#url":\s*"(https://aki-gm-resources[^"]*)"') {
                $candidate = $Matches[1]
                if ($candidate -match $urlPattern) {
                    $conveneUrl = $candidate
                }
            }
        }
    }
}

# ── Output result ───────────────────────────────────────────────────────────

Write-Host ""

if ($conveneUrl) {
    Set-Clipboard -Value $conveneUrl
    Write-Host "  URL found and copied to clipboard!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  $conveneUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor White
    Write-Host "  1. Go to Whispering Wishes (Profile tab > Import)" -ForegroundColor DarkGray
    Write-Host "  2. Paste the URL in the import field" -ForegroundColor DarkGray
    Write-Host "  3. Click Fetch" -ForegroundColor DarkGray
    Write-Host ""
} else {
    Write-Host "  Could not find Convene History URL." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Make sure you:" -ForegroundColor Yellow
    Write-Host "  1. Opened the game" -ForegroundColor DarkGray
    Write-Host "  2. Went to Convene History in-game" -ForegroundColor DarkGray
    Write-Host "  3. Then ran this script" -ForegroundColor DarkGray
    Write-Host ""
}

pause
