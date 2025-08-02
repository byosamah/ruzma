# GitHub Actions Setup for Supabase Deployment

## Required GitHub Secrets

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

### 1. SUPABASE_ACCESS_TOKEN
- Go to: https://supabase.com/account/tokens
- Create a **Personal Access Token**
- Copy the token value

### 2. SUPABASE_PROJECT_ID
- Your project ID: `***REMOVED***` (from supabase/config.toml)

### 3. SUPABASE_DB_PASSWORD (Optional)
- Your database password (only needed if you plan to run `db push` operations)

## Workflow Configuration

The workflow is configured to:
- ✅ Deploy on pushes to `test` branch
- ✅ Run on pull requests to `test` branch
- ✅ Deploy all Edge Functions
- ✅ Apply database migrations (if any)
- ✅ Generate TypeScript types

## How to Use

1. **Add the secrets** to your GitHub repo
2. **Push to test branch** or create a PR to test branch
3. **Monitor the workflow** in the Actions tab

## Edge Functions Deployed

Based on your `supabase/functions/` directory, these functions will be deployed:
- approve-contract
- check-notifications
- create-checkout
- get-client-project
- lemon-squeezy-webhook
- resend-contract
- send-client-link
- send-contact-email
- send-contract-approval
- send-invoice-with-frontend-pdf
- send-payment-notification
- submit-payment-proof
- submit-revision-request
- upload-client-payment-proof
- upload-profile-picture
- upload-revision-image

## Troubleshooting

If the workflow fails:
1. Check the **Actions** tab for detailed logs
2. Verify all **secrets are correctly set**
3. Ensure **Supabase CLI** has proper permissions
4. Check if **database migrations** are valid

## Manual Commands (for testing locally)

```bash
# Link to project
supabase link --project-ref ***REMOVED***

# Deploy functions
supabase functions deploy all

# Push database changes
supabase db push

# Generate types
supabase gen types typescript --local > types/supabase.ts
```