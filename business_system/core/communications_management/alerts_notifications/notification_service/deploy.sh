#!/bin/bash
# deploy.sh: Build Docker image and deploy to Minikube using kubectl

set -e

SERVICE_NAME="dibank-notification-service"
IMAGE_NAME="$SERVICE_NAME:latest"
DEPLOY_DIR="$(dirname "$0")/deploy"

# Build Docker image inside Minikube's Docker daemon
echo "[1/4] Setting Docker env for Minikube..."
eval $(minikube docker-env)

echo "[2/4] Building Docker image: $IMAGE_NAME ..."
docker build -t $IMAGE_NAME .

echo "[3/4] Applying ConfigMap, Deployment, and Service..."
kubectl apply -f "$DEPLOY_DIR/configmap.yaml"
kubectl apply -f "$DEPLOY_DIR/deployment.yaml"
kubectl apply -f "$DEPLOY_DIR/service.yaml"

echo "[4/4] Deployment complete. Service is available at NodePort:"
kubectl get svc $SERVICE_NAME

