# Generate local TLS certs with mkcert and create K8s secret yt-tutor-tls.
# Prerequisite: install mkcert, then run once:  mkcert -install
#   Windows (scoop):  scoop install mkcert
#   Windows (choco):  choco install mkcert
# Run from repo root:  .\scripts\mkcert-setup.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$mkcert = Get-Command mkcert -ErrorAction SilentlyContinue
if (-not $mkcert) {
    throw @"
mkcert not found on PATH.

Install (pick one):
  scoop install mkcert
  choco install mkcert

Then trust the local CA (one time, may need Admin):
  mkcert -install

Re-run:  .\scripts\mkcert-setup.ps1
"@
}

$CertDir = Join-Path $Root "certs"
New-Item -ItemType Directory -Force -Path $CertDir | Out-Null

$CertFile = Join-Path $CertDir "localhost.pem"
$KeyFile  = Join-Path $CertDir "localhost-key.pem"

Write-Host "==> Generating certs for localhost / 127.0.0.1 ..." -ForegroundColor Cyan
Push-Location $CertDir
try {
    # Fixed filenames so scripts can find them
    & mkcert -cert-file "localhost.pem" -key-file "localhost-key.pem" localhost 127.0.0.1 ::1
} finally {
    Pop-Location
}

if (-not (Test-Path $CertFile) -or -not (Test-Path $KeyFile)) {
    throw "mkcert did not create expected files in certs\"
}

Write-Host "==> Ensuring namespace yt-tutor ..." -ForegroundColor Cyan
kubectl apply -f .\k8s\00-namespace.yaml

Write-Host "==> Creating/updating TLS secret yt-tutor-tls ..." -ForegroundColor Cyan
kubectl create secret tls yt-tutor-tls `
  --namespace yt-tutor `
  --cert="$CertFile" `
  --key="$KeyFile" `
  --dry-run=client -o yaml | kubectl apply -f -

Write-Host ""
Write-Host "TLS secret ready. After nginx is deployed, open:" -ForegroundColor Green
Write-Host "  https://localhost:30443"
Write-Host ""
Write-Host "If the browser warns, run once:  mkcert -install" -ForegroundColor Yellow
