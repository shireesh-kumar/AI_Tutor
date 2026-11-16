# Scale only the backend Deployment.
# Usage:  .\scripts\k8s-scale-backend.ps1 4

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [int]$Replicas
)

$ErrorActionPreference = "Stop"

kubectl scale deployment backend -n yt-tutor --replicas=$Replicas
kubectl get pods -n yt-tutor -l app=backend
kubectl get endpoints backend -n yt-tutor

Write-Host "Backend scaled to $Replicas. Nginx still targets Service 'backend'." -ForegroundColor Green
