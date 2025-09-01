#!/bin/bash

# Ruzma Deployment Script
# Run this script to deploy to your specific Vercel project

echo "🚀 Deploying Ruzma to Vercel..."

# Clean up any existing vercel config
rm -rf .vercel

# Create the correct project configuration
mkdir -p .vercel
cat > .vercel/project.json << EOF
{
  "projectId": "prj_ANaDOJ3ijEbYwtWPqoAq6LT8BEYb",
  "orgId": "team_byosama"
}
EOF

echo "📦 Building project..."
npm run build

echo "🌐 Deploying to production..."
vercel deploy --prod --yes

echo "✅ Deployment complete!"
echo "🔗 Your app should be available at: https://ruzma-1nu0qmnmm-byosama.vercel.app"