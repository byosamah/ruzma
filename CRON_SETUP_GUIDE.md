# ⏰ **AUTOMATED SUBSCRIPTION PROCESSING SETUP**

## **Overview**
The `process-expired-subscriptions` function needs to run automatically every hour to:
- Find expired grace periods
- Downgrade users to free tier
- Send notifications
- Clean up expired data

## **Option 1: Supabase Cron (Recommended)**

### **Enable pg_cron Extension**
1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/***REMOVED***
2. **Navigate to**: Database → Extensions
3. **Enable**: `pg_cron` extension

### **Create Cron Job in SQL Editor**
```sql
-- Schedule the function to run every hour
SELECT cron.schedule(
  'process-expired-subscriptions-hourly',
  '0 * * * *',  -- Every hour at minute 0
  $$
    SELECT net.http_post(
      url := 'https://***REMOVED***.supabase.co/functions/v1/process-expired-subscriptions',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
```

### **Verify Cron Job**
```sql
-- Check if cron job was created
SELECT * FROM cron.job;

-- View cron job logs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## **Option 2: External Cron Service (Alternative)**

### **Using GitHub Actions (Free)**
Create `.github/workflows/subscription-processing.yml`:
```yaml
name: Process Expired Subscriptions
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:  # Manual trigger

jobs:
  process-subscriptions:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Function
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            https://***REMOVED***.supabase.co/functions/v1/process-expired-subscriptions
```

### **Using Vercel Cron (if on Vercel)**
Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/process-subscriptions",
      "schedule": "0 * * * *"
    }
  ]
}
```

Create `pages/api/process-subscriptions.js`:
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      'https://***REMOVED***.supabase.co/functions/v1/process-expired-subscriptions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process subscriptions' });
  }
}
```

---

## **Option 3: Manual Testing**

### **Test the Function Manually**
```bash
# Test using curl
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  https://***REMOVED***.supabase.co/functions/v1/process-expired-subscriptions
```

### **Expected Response**
```json
{
  "success": true,
  "processed": 3,
  "downgraded": 2,
  "notifications_sent": 2,
  "message": "Processed 3 expired subscriptions"
}
```

---

## **Monitoring & Alerting**

### **Function Logs Monitoring**
1. **Supabase Dashboard** → Edge Functions → `process-expired-subscriptions`
2. Monitor for:
   - Execution frequency (should be hourly)
   - Error rates (should be near 0%)
   - Processing counts (varies by usage)

### **Database Monitoring**
```sql
-- Check recent subscription events
SELECT 
  event_type, 
  COUNT(*) as count,
  DATE_TRUNC('hour', created_at) as hour
FROM subscription_events 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type, hour
ORDER BY hour DESC;

-- Check expired subscriptions
SELECT COUNT(*) as expired_count
FROM subscriptions s
WHERE (
  (s.status = 'on_trial' AND s.grace_period_ends_at < NOW())
  OR 
  (s.status = 'unpaid' AND s.payment_grace_ends_at < NOW())
);
```

### **Alert Setup (Optional)**
Set up alerts for:
- Function execution failures
- High number of downgrades (unusual activity)
- Database connection issues
- Webhook delivery failures

---

## **Troubleshooting Common Issues**

### **Cron Job Not Running**
1. Check if `pg_cron` extension is enabled
2. Verify the cron job exists in `cron.job` table
3. Check `cron.job_run_details` for error logs
4. Ensure service role key is correct

### **Function Errors**
1. Check function logs in Supabase dashboard
2. Verify environment variables are set
3. Test function manually with curl
4. Check database connectivity

### **Database Permission Issues**
```sql
-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION find_expired_grace_periods() TO service_role;
GRANT ALL ON subscription_events TO service_role;
GRANT ALL ON notification_queue TO service_role;
```

---

## **Success Metrics**

After setup, monitor these metrics:
- ✅ **Cron Job Frequency**: Runs every hour
- ✅ **Function Success Rate**: >99%
- ✅ **Processing Time**: <30 seconds per execution
- ✅ **Downgrade Accuracy**: Only expired grace periods processed
- ✅ **Notification Delivery**: Users notified before/after downgrade

---

## **Next Steps**

1. **Choose Option 1** (Supabase Cron) for simplicity
2. **Test manually** first to ensure function works
3. **Monitor logs** for first 24 hours after setup
4. **Set up alerts** if processing critical subscriptions
5. **Document** the schedule for your team

This automated processing is the FINAL piece needed for a fully autonomous subscription system! 🚀