# Build images, create secrets from Backend/.env, apply k8s manifests.
# Run from repo root:  .\scripts\k8s-up.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> Building images..." -ForegroundColor Cyan
docker build -t yt-tutor-backend:latest ./Backend
docker build -t yt-tutor-frontend:latest ./FrontEnd

$envFile = Join-Path $Root "Backend\.env"
if (-not (Test-Path $envFile)) {
    throw "Missing Backend\.env — copy Backend\.env.example and fill keys."
}

# Parse KEY=VALUE lines (ignore blanks/comments; trim spaces around =)
$vars = @{}
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $parts = $line -split "=", 2
    if ($parts.Count -eq 2) {
        $vars[$parts[0].Trim()] = $parts[1].Trim().Trim('"')
    }
}

foreach ($required in @("ANTHROPIC_API_KEY", "GEMINI_API_KEY", "MODEL_NAME")) {
    if (-not $vars.ContainsKey($required) -or [string]::IsNullOrWhiteSpace($vars[$required])) {
        throw "Backend\.env missing required key: $required"
    }
}
if (-not $vars.ContainsKey("TEMPERATURE")) { $vars["TEMPERATURE"] = "0.3" }

Write-Host "==> Ensuring namespace + secrets..." -ForegroundColor Cyan
kubectl apply -f .\k8s\00-namespace.yaml

# Local HTTPS certs (mkcert) — required before nginx Deployment starts
Write-Host "==> Setting up mkcert TLS secret..." -ForegroundColor Cyan
& "$PSScriptRoot\mkcert-setup.ps1"

kubectl create secret generic yt-tutor-secrets `
  --namespace yt-tutor `
  --from-literal=ANTHROPIC_API_KEY="$($vars['ANTHROPIC_API_KEY'])" `
  --from-literal=GEMINI_API_KEY="$($vars['GEMINI_API_KEY'])" `
  --from-literal=MODEL_NAME="$($vars['MODEL_NAME'])" `
  --from-literal=TEMPERATURE="$($vars['TEMPERATURE'])" `
  --dry-run=client -o yaml | kubectl apply -f -

Write-Host "==> Applying manifests..." -ForegroundColor Cyan
kubectl apply -f .\k8s\

Write-Host "==> Waiting for rollouts..." -ForegroundColor Cyan
kubectl rollout status deployment/backend -n yt-tutor --timeout=180s
kubectl rollout status deployment/nginx -n yt-tutor --timeout=120s

Write-Host ""
Write-Host "Done. Prefer:  https://localhost:30443" -ForegroundColor Green
Write-Host "Also HTTP:     http://localhost:30080" -ForegroundColor Green
Write-Host "Port-forward:  kubectl port-forward -n yt-tutor svc/nginx 8443:443" -ForegroundColor Green
Write-Host "               then https://localhost:8443" -ForegroundColor Green
