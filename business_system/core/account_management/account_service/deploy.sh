#!/bin/bash

# deployment.sh
set -e

# Define container group name
CONTAINER_GROUP="dibank"
SERVICE_NAME="dibank-account-service"
PORT=8103

echo "🚀 Starting deployment process..."

# Switch to minikube's Docker daemon
echo "🔄 Switching to minikube Docker daemon..."
eval $(minikube docker-env)

# Build the application
echo "📦 Building Spring Boot application..."
./gradlew clean build

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t dibank-account-service:latest .

# Create k8s resources
echo "☸️ Creating Kubernetes resources..."

# Delete existing resources first
echo "🗑️ Cleaning up existing resources..."
kubectl delete -f deploy/service.yaml --ignore-not-found
kubectl delete -f deploy/deployment.yaml --ignore-not-found

# Wait for resources to be deleted
echo "⏳ Waiting for resources to be cleaned up..."
sleep 5

# Apply k8s manifests
echo "🚀 Applying Kubernetes manifests..."
kubectl apply -f deploy/deployment.yaml
kubectl apply -f deploy/service.yaml

# Verify deployment
echo "🔍 Verifying deployment..."
kubectl get pods -l app=dibank-account-service
kubectl get services dibank-account-service

echo "✅ Deployment completed!"


# Forward the service port to your local machine
sleep 5
kubectl port-forward service/dibank-account-service 8101:8101