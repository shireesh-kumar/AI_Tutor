# Tear down YT-Tutor workloads so Deployments cannot recreate pods.
# Run from repo root:  .\scripts\k8s-down.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> Deleting k8s resources (includes Deployments)..." -ForegroundColor Yellow
kubectl delete -f .\k8s\ --ignore-not-found

Write-Host "==> Remaining resources in namespace (if any):" -ForegroundColor Cyan
kubectl get all -n yt-tutor 2>$null

Write-Host ""
Write-Host "App stopped. Secrets may still exist:" -ForegroundColor Green
Write-Host "  kubectl delete secret yt-tutor-secrets -n yt-tutor"
Write-Host "  kubectl delete namespace yt-tutor"
