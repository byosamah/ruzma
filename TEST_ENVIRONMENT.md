# Test Environment Guide

This guide explains how to use the **Test Ruzma** environment for safe development and testing before deploying to production.

## 📋 Overview

Ruzma has **two separate environments**:

| Environment | Branch | URL | Purpose |
|------------|--------|-----|---------|
| **Production** | `main` | https://app.ruzma.co | Live app for real users |
| **Test** | `test` | https://test-ruzma.vercel.app | Safe testing environment |

Both environments:
- ✅ Share the same Supabase database
- ✅ Use the same Lemon Squeezy payment setup
- ✅ Auto-deploy when you push to GitHub

## 🚀 Quick Start

### Testing a New Feature

```bash
# 1. Switch to test branch
git checkout test

# 2. Make your changes
# ... edit files ...

# 3. Commit and push (auto-deploys to test!)
git add .
git commit -m "feat: your new feature"
git push origin test
```

**That's it!** Your changes are now live at https://test-ruzma.vercel.app

### Promoting to Production

Once you've tested and everything works:

```bash
# 1. Switch to main branch
git checkout main

# 2. Merge the tested changes
git merge test

# 3. Push to production (auto-deploys!)
git push origin main
```

**Done!** Your changes are now live at https://app.ruzma.co

## 📂 Branch Structure

```
main (production)
 └── test (testing/staging)
      └── feature-xyz (your feature branches)
```

### Workflow:
1. Create feature branches from `test`
2. Merge features into `test` → test at https://test-ruzma.vercel.app
3. When stable, merge `test` into `main` → production at https://app.ruzma.co

## 🛠️ Deployment Scripts

### Manual Deployment

If you want to deploy manually without pushing to GitHub:

**Test Environment:**
```bash
./deploy-test.sh
```

**Production Environment:**
```bash
./deploy.sh
```

Both scripts:
- ⚠️ Warn you if you're on the wrong branch
- ✅ Build the project
- ✅ Deploy to the correct Vercel project
- ✅ Show you the deployment URL

## 🌍 Environment Details

### Test Environment
- **Vercel Project**: `test-ruzma`
- **Project ID**: `prj_JSUXm2Sn35MHv81yFk1l65CnLc7Q`
- **URL**: https://test-ruzma.vercel.app
- **Branch**: `test`
- **Database**: Same as production (Supabase)
- **Payments**: Same as production (Lemon Squeezy)

### Production Environment
- **Vercel Project**: `ruzma`
- **Project ID**: `prj_ANaDOJ3ijEbYwtWPqoAq6LT8BEYb`
- **URL**: https://app.ruzma.co
- **Branch**: `main`
- **Database**: Supabase production database
- **Payments**: Lemon Squeezy production

## ⚠️ Important Notes

### Database Sharing
Both environments share the **same Supabase database**. This means:
- ✅ You can test with real data
- ⚠️ Changes affect both environments
- ⚠️ Be careful when testing data modifications

### Payment Testing
Both environments use **production Lemon Squeezy**. This means:
- ⚠️ Test payments will be **real charges**
- 💡 Consider disabling payment features in test or using test card details carefully
- 💡 Or set up Lemon Squeezy test mode (requires additional configuration)

### Auto-Deployment
Both projects are configured to auto-deploy when you push to GitHub:
- Push to `test` branch → Deploys to https://test-ruzma.vercel.app
- Push to `main` branch → Deploys to https://app.ruzma.co

No manual deployment needed unless you want to override!

## 🔄 Git Workflow Examples

### Example 1: Quick Fix

```bash
# Working on test branch
git checkout test

# Make fix
# ... edit files ...

# Deploy to test
git add .
git commit -m "fix: button styling"
git push origin test

# Wait 1-2 minutes, check https://test-ruzma.vercel.app
# If good, promote to production:

git checkout main
git merge test
git push origin main
```

### Example 2: New Feature

```bash
# Create feature branch from test
git checkout test
git checkout -b feature-export

# Build feature
# ... work on feature ...

# Commit progress
git add .
git commit -m "feat: add export functionality"

# Merge to test for testing
git checkout test
git merge feature-export
git push origin test

# Test at https://test-ruzma.vercel.app
# If good, promote to production:

git checkout main
git merge test
git push origin main

# Clean up feature branch
git branch -d feature-export
```

## 📊 Vercel Dashboard

### Viewing Deployments

**Test Project:**
https://vercel.com/byosama/test-ruzma

**Production Project:**
https://vercel.com/byosama/ruzma

### Checking Deployment Status

```bash
# List all projects
vercel project ls

# Check recent deployments
vercel inspect test-ruzma.vercel.app --logs
vercel inspect app.ruzma.co --logs
```

## 🐛 Troubleshooting

### Problem: Changes not showing up

**Solution:** Check deployment status in Vercel dashboard. Build may have failed.

```bash
# Check logs
vercel inspect test-ruzma.vercel.app --logs
```

### Problem: Wrong project deployed

**Solution:** Make sure you're on the correct branch before pushing.

```bash
# Check current branch
git branch --show-current

# Switch branch
git checkout test  # or main
```

### Problem: Build failed

**Solution:** Test build locally before pushing.

```bash
# Test build
npm run build

# Test type checking
npm run typecheck

# If local build works, push again
git push origin test
```

## 📝 Best Practices

1. **Always test on `test` branch first**
   - Never push directly to `main`
   - Test changes at https://test-ruzma.vercel.app

2. **Use the deployment scripts**
   - `./deploy-test.sh` - For manual test deployments
   - `./deploy.sh` - For manual production deployments
   - They include safety checks!

3. **Check build before pushing**
   ```bash
   npm run build
   npm run typecheck
   ```

4. **Keep branches in sync**
   ```bash
   # Regularly merge main into test to keep it updated
   git checkout test
   git merge main
   git push origin test
   ```

5. **Be careful with database changes**
   - Both environments share the same database
   - Test database migrations carefully

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Switch to test | `git checkout test` |
| Switch to production | `git checkout main` |
| Deploy test manually | `./deploy-test.sh` |
| Deploy production manually | `./deploy.sh` |
| Check current branch | `git branch --show-current` |
| View test site | https://test-ruzma.vercel.app |
| View production site | https://app.ruzma.co |
| Check deployments | `vercel project ls` |

## 🆘 Need Help?

- Check deployment logs in Vercel dashboard
- Run local build to test: `npm run build`
- Check type errors: `npm run typecheck`
- Review this guide: `TEST_ENVIRONMENT.md`

---

**Happy Testing! 🧪**
