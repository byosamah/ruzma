#!/bin/bash

# Ruzma TEST Environment Deployment Script
# Run this script to deploy to the TEST Vercel project
# This deploys from the 'test' branch

echo "🧪 Deploying Test Ruzma to Vercel..."

# Check if we're on the test branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "test" ]; then
  echo "⚠️  WARNING: You're on branch '$CURRENT_BRANCH', not 'test'"
  read -p "Continue anyway? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
  fi
fi

# Clean up any existing vercel config
rm -rf .vercel

# Create the correct TEST project configuration
mkdir -p .vercel
cat > .vercel/project.json << EOF
{
  "projectId": "prj_JSUXm2Sn35MHv81yFk1l65CnLc7Q",
  "orgId": "team_6zy66TqDwaNcJ3SGSLZZjTjO",
  "projectName": "test-ruzma"
}
EOF

echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Aborting deployment."
  exit 1
fi

echo "🌐 Deploying to TEST environment..."
vercel deploy --prod --yes

echo "✅ Deployment complete!"
echo "🔗 Your TEST app is available at: https://test-ruzma.vercel.app"
echo ""
echo "💡 Tip: Changes to the 'test' branch on GitHub will auto-deploy to this URL"
