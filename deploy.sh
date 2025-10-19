#!/bin/bash

# Ruzma PRODUCTION Environment Deployment Script
# Run this script to deploy to the PRODUCTION Vercel project
# This deploys from the 'main' branch to https://app.ruzma.co

echo "🚀 Deploying Ruzma to PRODUCTION..."

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "⚠️  WARNING: You're on branch '$CURRENT_BRANCH', not 'main'"
  read -p "Continue deploying to PRODUCTION anyway? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
  fi
fi

# Clean up any existing vercel config
rm -rf .vercel

# Create the correct PRODUCTION project configuration
mkdir -p .vercel
cat > .vercel/project.json << EOF
{
  "projectId": "prj_ANaDOJ3ijEbYwtWPqoAq6LT8BEYb",
  "orgId": "team_6zy66TqDwaNcJ3SGSLZZjTjO",
  "projectName": "ruzma"
}
EOF

echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Aborting deployment."
  exit 1
fi

echo "🌐 Deploying to PRODUCTION environment..."
vercel deploy --prod --yes

echo "✅ Deployment complete!"
echo "🔗 Your PRODUCTION app is available at: https://app.ruzma.co"
echo ""
echo "💡 Tip: Changes to the 'main' branch on GitHub will auto-deploy to this URL"