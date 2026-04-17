#!/bin/bash
# DO NOT RUN WITHOUT EXPLICIT PERMISSION FROM ANDREW
echo "============================================="
echo "⚠️  PRODUCTION DEPLOYMENT INITIATED ⚠️ "
echo "============================================="
read -p "Are you absolutely sure you want to push to fuelly.live? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Deployment aborted."
    exit 1
fi

echo "Building React frontend..."
cd frontend
npm run build

echo "Copying to Nginx production folder..."
cp -r dist/* /home/linuxbrew/.linuxbrew/var/www/fuelly/

echo "Reloading Nginx..."
sudo /home/linuxbrew/.linuxbrew/opt/nginx/bin/nginx -s reload

echo "✅ Production Deployment Complete."
