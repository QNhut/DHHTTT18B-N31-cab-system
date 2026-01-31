#!/bin/bash

# Docker build and deployment script for Pricing Service

set -e

# Configuration
IMAGE_NAME="hoangminhtit/pricing-service"
TAG=${1:-"latest"}
FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

echo "🚀 Building Pricing Service Docker Image..."
echo "📦 Image: ${FULL_IMAGE_NAME}"

# Build the Docker image
echo "⚡ Building Docker image..."
docker build \
  --tag ${FULL_IMAGE_NAME} \
  --platform linux/amd64 \
  --no-cache \
  .

echo "✅ Docker image built successfully!"

# Optional: Test the image locally
echo "🧪 Testing the image..."
docker run --rm \
  --env GOOGLE_API_KEY="${GOOGLE_API_KEY}" \
  --env PORT=3001 \
  --publish 3001:3001 \
  --detach \
  --name pricing-service-test \
  ${FULL_IMAGE_NAME}

# Wait for service to start
sleep 5

# Test health endpoint
echo "🏥 Testing health endpoint..."
if curl -f http://localhost:3001/health; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    exit 1
fi

# Stop test container
echo "🛑 Stopping test container..."
docker stop pricing-service-test

echo "🎉 Build and test completed successfully!"
echo "📋 To push to Docker Hub:"
echo "   docker push ${FULL_IMAGE_NAME}"
echo "📋 To run with docker-compose:"
echo "   docker-compose up -d"