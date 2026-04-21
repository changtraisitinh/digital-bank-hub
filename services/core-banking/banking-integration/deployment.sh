#!/bin/bash

# deployment.sh
set -e

# Define container group name
CONTAINER_GROUP="dibank"
SERVICE_NAME="dibank-integration-service"
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
docker build -t dibank-banking-integration:latest .

# Create k8s resources
echo "☸️ Creating Kubernetes resources..."

# Create base64 encoded secrets (replace with your actual values)
echo "🔐 Creating secrets..."
cat << EOF > deploy/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: vietqr-secrets
type: Opaque
data:
  client-id: $(echo -n "c2127e24-dd81-4fdd-9a9b-16fad3ed76af" | base64)
  api-key: $(echo -n "d4277711-6c12-4cab-8fd7-f1cdf3a26d03" | base64)
EOF

# Create ConfigMap
echo "⚙️ Creating ConfigMap..."
cat << EOF > deploy/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: vietqr-config
data:
  url-gen-qr: "https://api.vietqr.io/v2/generate"
EOF

# Delete existing resources first
echo "🗑️ Cleaning up existing resources..."
kubectl delete -f deploy/service.yaml --ignore-not-found
kubectl delete -f deploy/deployment.yaml --ignore-not-found
kubectl delete -f deploy/configmap.yaml --ignore-not-found
kubectl delete -f deploy/secret.yaml --ignore-not-found

# Wait for resources to be deleted
echo "⏳ Waiting for resources to be cleaned up..."
sleep 5

# Apply k8s manifests
echo "🚀 Applying Kubernetes manifests..."
kubectl apply -f deploy/configmap.yaml
kubectl apply -f deploy/secret.yaml
kubectl apply -f deploy/deployment.yaml
kubectl apply -f deploy/service.yaml

# Verify deployment
echo "🔍 Verifying deployment..."
kubectl get pods -l app=dibank-banking-integration
kubectl get services dibank-banking-integration

echo "✅ Deployment completed!"


# Forward the service port to your local machine
sleep 5
kubectl port-forward service/dibank-banking-integration 8103:8103

# Verify port is accessible
echo "🔗 Verifying port accessibility..."
if curl -s http://localhost:${PORT} > /dev/null; then
    echo "✅ Service is accessible at http://localhost:${PORT}"
else
    echo "❌ Service is not accessible. Please check the deployment."
    exit 1
fi
