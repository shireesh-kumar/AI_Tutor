# YT-Tutor on Kubernetes (single-node)

```
Browser → nginx
            https://localhost:30443  (mkcert TLS)
            http://localhost:30080   (also works)
            ├─ /        → frontend (1 replica)
            └─ /api/    → backend Service → FastAPI pods (scalable)
                            └─ qdrant:6333 (1 replica, shared vectors)
```

- **Deployment** keeps the desired number of backend pods running.
- **Service** `backend` tracks live pod IPs (Endpoints). Nginx talks only to `backend:8000`.
- Scale **backend only**. Keep Qdrant at 1.
- **Local HTTPS** via **mkcert** → Secret `yt-tutor-tls` (not for public prod; use cert-manager / Certbot later).

## Prerequisites

- Docker
- Kubernetes enabled (Docker Desktop → Kubernetes, or `kind`)
- `kubectl`
- **mkcert** (`scoop install mkcert` or `choco install mkcert`), then once: `mkcert -install`

## 1. Build images

From the repo root:

```powershell
docker build -t yt-tutor-backend:latest ./Backend
docker build -t yt-tutor-frontend:latest ./FrontEnd
```

### If you use kind

```powershell
kind load docker-image yt-tutor-backend:latest --name yt-tutor
kind load docker-image yt-tutor-frontend:latest --name yt-tutor
```

(Docker Desktop Kubernetes can usually use local images with `imagePullPolicy: IfNotPresent`.)

## 2. Create secrets (from Backend/.env)

Do **not** commit secrets. Create them in the cluster:

```powershell
kubectl create namespace yt-tutor --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic yt-tutor-secrets `
  --namespace yt-tutor `
  --from-literal=ANTHROPIC_API_KEY="YOUR_ANTHROPIC_KEY" `
  --from-literal=GEMINI_API_KEY="YOUR_GEMINI_KEY" `
  --from-literal=MODEL_NAME="claude-sonnet-4-5-20250929" `
  --from-literal=TEMPERATURE="0.3" `
  --dry-run=client -o yaml | kubectl apply -f -
```

Or use the helper script: `..\scripts\k8s-up.ps1` (also runs mkcert setup).

## 3. Local TLS (mkcert)

```powershell
.\scripts\mkcert-setup.ps1
```

Creates `certs/localhost.pem` + key (gitignored) and Secret `yt-tutor-tls`.

## 4. Apply manifests

```powershell
kubectl apply -f k8s/
```

## 5. Open the app

```powershell
kubectl get svc -n yt-tutor nginx
```

Prefer: **https://localhost:30443**  
Also: **http://localhost:30080**

(If NodePort is blocked on Docker Desktop, use port-forward:)

```powershell
kubectl port-forward -n yt-tutor svc/nginx 8443:443
```

Then open **https://localhost:8443**

---

## Scale backend

```powershell
# more API pods
kubectl scale deployment backend -n yt-tutor --replicas=4

# watch pods + endpoints (Service list updates automatically)
kubectl get pods -n yt-tutor -l app=backend -w
kubectl get endpoints backend -n yt-tutor
```

Nginx keeps using `backend:8000`. Kubernetes updates which pods sit behind that Service.

---

## Careful shutdown (so Deployment does not bring pods back)

A **Deployment** restarts pods if you only delete a pod while `replicas > 0`.

### Stop API traffic / scale to zero (safe pause)

```powershell
kubectl scale deployment backend -n yt-tutor --replicas=0
kubectl scale deployment frontend -n yt-tutor --replicas=0
kubectl scale deployment nginx -n yt-tutor --replicas=0
kubectl scale deployment qdrant -n yt-tutor --replicas=0
```

### Tear down the whole app (recommended full stop)

```powershell
kubectl delete -f k8s/
```

This removes Deployments, Services, and the PVC for Qdrant data in these manifests.

### Delete only backend (Deployment gone → pods stay gone)

```powershell
kubectl delete deployment backend -n yt-tutor
```

### Wrong: delete one pod while Deployment still wants N replicas

```powershell
# Pod comes back automatically — this is expected Deployment behavior
kubectl delete pod -n yt-tutor -l app=backend
```

### Optional: delete the whole local cluster

**kind**

```powershell
kind delete cluster --name yt-tutor
```

**Docker Desktop** — turn Kubernetes off in settings, or reset the cluster from the UI.

Helper: `..\scripts\k8s-down.ps1`

---

## Useful checks

```powershell
kubectl get all -n yt-tutor
kubectl logs -n yt-tutor -l app=backend --tail=50
kubectl describe endpoints backend -n yt-tutor
```
