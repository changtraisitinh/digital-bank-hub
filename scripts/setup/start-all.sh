#!/usr/bin/env bash

# -----------------------------------------------------------------------------
# Start all services in the repository.
# -----------------------------------------------------------------------------

set -euo pipefail

SERVICES=(
    "services/security/mfa-service/docker-compose.yml"
    "services/communications/notification-service/deployments/docker-compose.yml"
)

for compose_file in "${SERVICES[@]}"; do
    if [[ ! -f "$compose_file" ]]; then
        echo "⚠️  Compose file not found: $compose_file" >&2
        continue
    fi
    echo "🛠️  Starting service defined in $compose_file"
    docker compose -f "$compose_file" up -d --build
done

echo "✅ All services started."

