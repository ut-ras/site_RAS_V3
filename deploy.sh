#!/usr/bin/env bash
set -e

# Create temporary SSH config
TMP_SSH_CFG="$(mktemp)"
trap 'rm -f "$TMP_SSH_CFG"' EXIT

cat >"$TMP_SSH_CFG" <<EOF
Host *.cs.utexas.edu
    User karma
Host panel.utweb.utexas.edu
    HostName panel.utweb.utexas.edu
    ProxyJump linux.cs.utexas.edu
    User km54774
$SSH_OPTIONS
EOF

#ssh -F "$TMP_SSH_CFG" km54774@panel.utweb.utexas.edu 
#exit
# Build site
echo "Building site..."
npm run build
echo "Done."

# Copy files to remote directory
echo "Copying files to remote directory..."
scp -F "$TMP_SSH_CFG" -r dist/. panel.utweb.utexas.edu:/home/utweb/utw10091/public_html/

# Fix permissions
ssh -F "$TMP_SSH_CFG" panel.utweb.utexas.edu \
    "chmod -R o+rX /home/utweb/utw10091/public_html" || true

echo "Done."

