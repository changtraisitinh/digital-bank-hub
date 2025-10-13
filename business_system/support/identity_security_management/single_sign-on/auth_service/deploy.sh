#!/bin/bash

# Get the directory containing the script
#SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Define container group name
CONTAINER_GROUP="dibank"
SERVICE_NAME="dibank-auth-service"
PORT=8104

# Check if port is already in use
if lsof -i :${PORT} > /dev/null; then
    echo "Port ${PORT} is already in use. Please free up the port first."
    exit 1
fi

# Delete existing k8s resources
kubectl delete deployment deploy/local/dibank-auth-service --ignore-not-found
kubectl delete service deploy/local/dibank-auth-service --ignore-not-found
kubectl delete ingress deploy/local/dibank-auth-service --ignore-not-found

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
kubectl apply -f deploy/local/auth-deployment.yaml
kubectl apply -f deploy/local/auth-service.yaml
kubectl apply -f deploy/local/auth-ingress.yaml

# Add local DNS entry (requires sudo)
#echo "127.0.0.1 ${SERVICE_NAME}.local" | sudo tee -a /etc/hosts

# Wait for deployment
#kubectl rollout status deployment/${SERVICE_NAME}


# Verify port is accessible
