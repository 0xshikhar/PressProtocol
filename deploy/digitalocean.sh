#!/bin/bash
# ==============================================================================
# DigitalOcean 1-Click Droplet Cloud-Init Bootstrap Script
# PressProtocol Sovereign Autonomous Node Deployment
# ==============================================================================

set -e

export DEBIAN_FRONTEND=noninteractive

echo "🚀 Bootstrapping PressProtocol Sovereign Node Droplet..."

# Update package index and install Docker
apt-get update -y
apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release ufw

# Install Docker CE
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 4000/tcp
ufw --force enable

# Prepare persistent data structure
DATA_DIR="/var/lib/pressprotocol/data"
mkdir -p "${DATA_DIR}/ipfs" "${DATA_DIR}/tor/onion_service" "${DATA_DIR}/db"
chmod 700 "${DATA_DIR}/tor/onion_service"

# Create systemd service unit for pressprotocol-node
cat << 'EOF' > /etc/systemd/system/pressprotocol-node.service
[Unit]
Description=PressProtocol Autonomous Sovereign Node
After=docker.service
Requires=docker.service

[Service]
TimeoutStartSec=0
Restart=always
ExecStartPre=-/usr/bin/docker stop pressprotocol-node
ExecStartPre=-/usr/bin/docker rm pressprotocol-node
ExecStart=/usr/bin/docker run --name pressprotocol-node \
  -p 4000:4000 \
  -p 4001:4001 \
  -p 9050:9050 \
  -v /var/lib/pressprotocol/data:/data \
  -e PORT=4000 \
  -e NODE_ENV=production \
  -e DATA_DIR=/data \
  -e TOR_ENABLED=true \
  -e AUTO_PIN_POLICY=all \
  -e NODE_NAME="PressProtocol DigitalOcean Droplet" \
  pressprotocol/node:latest
ExecStop=/usr/bin/docker stop pressprotocol-node

[Install]
WantedBy=multi-user.target
EOF

# Reload and start service
systemctl daemon-reload
systemctl enable --now pressprotocol-node.service

echo "✅ PressProtocol Sovereign Node installed and running as systemd service!"
