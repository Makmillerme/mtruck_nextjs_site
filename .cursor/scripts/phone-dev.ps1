#Requires -Version 5.1
# Phone preview for local Next.js — outside the app product.
# Modes:
#   Adb (default) — USB + adb reverse → http://localhost:PORT on phone
#   Lan           — same Wi-Fi → http://<PC-LAN-IP>:PORT (no cable)
# Does not change package.json / next.config / app/. Does not start npm run dev.
param(
  [ValidateSet("Adb", "Lan")]
  [string] $Mode = "Adb",
  [int] $Port = 3000,
  [switch] $OpenFirewall
)

$ErrorActionPreference = "Stop"

$cursorDir = Split-Path $PSScriptRoot -Parent
$portableAdb = Join-Path $cursorDir "tools\platform-tools\adb.exe"

function Get-AdbPath {
  if (Test-Path $portableAdb) { return $portableAdb }
  $cmd = Get-Command adb -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $candidates = @(
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    "$env:ANDROID_HOME\platform-tools\adb.exe",
    "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe"
  )
  foreach ($p in $candidates) {
    if ($p -and (Test-Path $p)) { return $p }
  }
  return $null
}

function Get-LanIPv4 {
  $rows = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*" -and
      $_.PrefixOrigin -ne "WellKnown"
    } |
    Sort-Object {
      if ($_.InterfaceAlias -match "Wi-?Fi|WLAN") { 0 } else { 1 }
    }, InterfaceAlias
  if (-not $rows) { return $null }
  return $rows[0]
}

function Test-PortListening([int] $ListenPort) {
  $listeners = Get-NetTCPConnection -LocalPort $ListenPort -State Listen -ErrorAction SilentlyContinue
  return [bool]$listeners
}

Write-Host "MTruck phone-dev ($Mode) - port $Port"
Write-Host ""

if ($Mode -eq "Lan") {
  $lan = Get-LanIPv4
  if (-not $lan) {
    Write-Host "No LAN IPv4 found. Connect PC to Wi-Fi and retry."
    exit 1
  }

  $ip = $lan.IPAddress
  $url = "http://${ip}:$Port"
  Write-Host "PC LAN: $ip ($($lan.InterfaceAlias))"
  Write-Host "Phone URL (same Wi-Fi): $url"
  Write-Host ""

  if (-not (Test-PortListening $Port)) {
    Write-Host "Nothing is listening on port $Port."
    Write-Host "Start Next on the PC (you run this, not the agent):"
    Write-Host "  npm run dev -- -H 0.0.0.0 -p $Port"
    Write-Host "If the port is busy, match -p to the Network URL Next prints."
    exit 1
  }

  Write-Host "Port ${Port}: listening"

  if ($OpenFirewall) {
    $ruleName = "MTruck phone-dev TCP $Port"
    $existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    if (-not $existing) {
      try {
        New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port -Profile Private | Out-Null
        Write-Host "Firewall: added inbound allow for TCP $Port (Private)."
      } catch {
        Write-Host "Firewall rule failed (run PowerShell as Admin if needed): $($_.Exception.Message)"
      }
    } else {
      Write-Host "Firewall: rule already exists ($ruleName)."
    }
  } else {
    Write-Host "If the phone cannot connect, re-run with -OpenFirewall (Admin may be required),"
    Write-Host "or allow Node.js / port $Port in Windows Firewall for Private networks."
  }

  Write-Host ""
  Write-Host "OK: open on phone Chrome: $url"
  Write-Host "Phone and PC must be on the same Wi-Fi (not guest/VPN isolation)."
  exit 0
}

# --- Adb mode ---
$adb = Get-AdbPath
if (-not $adb) {
  Write-Host "adb not found. Run: powershell -NoProfile -File .cursor/scripts/install-platform-tools.ps1"
  exit 1
}

Write-Host "adb: $adb"
& $adb start-server | Out-Null
$devices = & $adb devices
Write-Host $devices

$ready = @($devices | Select-Object -Skip 1 | Where-Object { $_ -match "\tdevice$" })
if ($ready.Count -eq 0) {
  Write-Host "No authorized device (status device)."
  Write-Host "Check cable, USB debugging, and the Allow USB debugging prompt on the phone."
  Write-Host "Or use Wi-Fi mode: powershell -NoProfile -File .cursor/scripts/phone-dev.ps1 -Mode Lan"
  exit 1
}

& $adb reverse "tcp:$Port" "tcp:$Port"
if ($LASTEXITCODE -ne 0) {
  Write-Host "adb reverse failed (exit $LASTEXITCODE)."
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "OK: tcp:$Port -> tcp:$Port"
Write-Host "On the phone Chrome: http://localhost:$Port"
Write-Host "If npm run dev is not running, start it on the PC (this script does not)."
Write-Host "Wi-Fi without cable: -Mode Lan"
