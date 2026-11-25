#!/usr/bin/env bash
set -euo pipefail

: "${PINHOLE_IMAGE:?Set PINHOLE_IMAGE}"
: "${PINHOLE_CONTAINER:?Set PINHOLE_CONTAINER}"
: "${PINHOLE_PORT:?Set PINHOLE_PORT}"
: "${NPM_NETWORK:?Set NPM_NETWORK}"

case "$PINHOLE_CONTAINER" in
    pinhole|pinhole-staging) ;;
    *) echo "Unexpected container name: $PINHOLE_CONTAINER" >&2; exit 1 ;;
esac

cd "$(dirname "$0")/.."
docker network inspect "$NPM_NETWORK" >/dev/null
compose=(docker compose --project-name "$PINHOLE_CONTAINER" --file compose.yml)
"${compose[@]}" config --quiet

# Pull before changing the running container. Each environment has its own project.
"${compose[@]}" pull
previous_image=$(docker inspect --format '{{.Config.Image}}' "$PINHOLE_CONTAINER" 2>/dev/null || true)

if "${compose[@]}" up --detach --wait --wait-timeout 90; then
    echo "$PINHOLE_CONTAINER is healthy: $PINHOLE_IMAGE"
else
    echo "Deployment failed for $PINHOLE_CONTAINER." >&2
    "${compose[@]}" logs --tail 50 || true
    if [[ -n "$previous_image" ]]; then
        echo "Restoring $previous_image" >&2
        export PINHOLE_IMAGE="$previous_image"
        "${compose[@]}" up --detach --wait --wait-timeout 90
    fi
    exit 1
fi
