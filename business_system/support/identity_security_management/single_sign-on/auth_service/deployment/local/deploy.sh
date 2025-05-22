#!/bin/bash

# Get the directory containing the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Go to project root (two levels up from script location)
cd "$SCRIPT_DIR/../.."

# Define container group name
CONTAINER_GROUP="dibank"
SERVICE_NAME="dibank-auth-service"
PORT=8004

# Check if port is already in use
if lsof -i :${PORT} > /dev/null; then
    echo "Port ${PORT} is already in use. Please free up the port first."
    exit 1
fi

# Delete existing k8s resources
kubectl delete deployment dibank-auth-service --ignore-not-found
kubectl delete service dibank-auth-service --ignore-not-found
kubectl delete ingress dibank-auth-service --ignore-not-found

# Build the application
./gradlew clean build

# Remove existing containers using the image
#docker ps -a | grep 'dibank-auth-service' | awk '{print $1}' | xargs -r docker rm -f

# Remove existing containers in the group
docker ps -a --filter "name=${CONTAINER_GROUP}" -q | xargs -r docker rm -f


# Remove existing image
docker image rm ${SERVICE_NAME}:latest -f

# Build Docker image with container name and labels
docker build \
  --label "group=${CONTAINER_GROUP}" \
  --build-arg SERVICE_NAME=${SERVICE_NAME} \
  -t ${SERVICE_NAME}:latest .

# Apply k8s manifests
kubectl apply -f deployment/local/auth-deployment.yaml
kubectl apply -f deployment/local/auth-service.yaml
kubectl apply -f deployment/local/auth-ingress.yaml

# Add local DNS entry (requires sudo)
echo "127.0.0.1 ${SERVICE_NAME}.local" | sudo tee -a /etc/hosts

# Wait for deployment
#kubectl rollout status deployment/${SERVICE_NAME}


# Verify port is accessible
echo "Waiting for service to be accessible..."
timeout 30 bash -c 'until curl -s http://localhost:8004 > /dev/null; do sleep 1; done' || echo "Service not responding on port 8004"