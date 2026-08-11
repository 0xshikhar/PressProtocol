#!/bin/bash
set -e

echo "==============================================================="
echo "  🌐 PRESSPROTOCOL AUTONOMOUS COMMUNITY NODE CONTAINER"
echo "==============================================================="

DATA_DIR="${DATA_DIR:-/data}"
TOR_DIR="${DATA_DIR}/tor"
ONION_SERVICE_DIR="${TOR_DIR}/onion_service"
IPFS_DIR="${DATA_DIR}/ipfs"
DB_DIR="${DATA_DIR}/db"

# Create directories if they do not exist
mkdir -p "${ONION_SERVICE_DIR}" "${IPFS_DIR}" "${DB_DIR}"

# Tor requires strict 700 permissions on HiddenServiceDir
chmod 700 "${TOR_DIR}" "${ONION_SERVICE_DIR}"

# Configure torrc if not already custom
TORRC_FILE="/etc/tor/torrc"
cat << 'EOF' > "${TORRC_FILE}"
DataDirectory /var/lib/tor
HiddenServiceDir /data/tor/onion_service/
HiddenServicePort 80 127.0.0.1:4000
SocksPort 0.0.0.0:9050
Log notice stdout
EOF

# Ensure tor ownership
chown -R tor:tor /var/lib/tor "${TOR_DIR}"

# Start Tor daemon in background if enabled
if [ "${TOR_ENABLED}" != "false" ]; then
  echo "🧅 Starting embedded Tor v3 daemon..."
  su-exec tor tor -f "${TORRC_FILE}" --runasdaemon 1 || true

  # Wait up to 10 seconds for .onion hostname generation
  echo "⏳ Waiting for Tor v3 hidden service generation..."
  for i in $(seq 1 20); do
    if [ -f "${ONION_SERVICE_DIR}/hostname" ]; then
      ONION_ADDR=$(cat "${ONION_SERVICE_DIR}/hostname" | tr -d '[:space:]')
      echo "✅ Generated Tor v3 Onion Address: http://${ONION_ADDR}"
      export TOR_ONION_ADDRESS="${ONION_ADDR}"
      break
    fi
    sleep 0.5
  done
else
  echo "⚪ Tor daemon disabled by TOR_ENABLED=false"
fi

# Ensure pressprotocol user owns app & data dirs
chown -R 10001:10001 "${DATA_DIR}" /app/dist 2>/dev/null || true

echo "🚀 Launching PressProtocol Sovereign Node Process..."
exec su-exec 10001:10001 node dist/index.js
