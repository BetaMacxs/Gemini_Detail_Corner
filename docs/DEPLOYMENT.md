# DetailCorner Deployment Guide (Netlify + Supabase)

## 1. Netlify Frontend Configuration

The React SPA is deployed to Netlify. The project contains a `netlify.toml` file that handles the required single-page application `/*` rewrite rules automatically.

### Required Netlify Environment Variables
Set the following under **Site settings > Environment variables** in the Netlify dashboard:

*   `VITE_SUPABASE_URL`: Your Supabase Project URL (e.g., `https://xxxxxx.supabase.co`)
*   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon/Public Key.

*Note: Do NOT store the Supabase Service Role Key, PayFast Passphrase, or Brevo API keys in Netlify. Those belong exclusively in Supabase Edge Function Secrets.*

## 2. Supabase Configuration

### Authentication Redirect URLs
In your Supabase Dashboard (**Authentication > URL Configuration**), you MUST add your live Netlify domain to the **Site URL** and **Additional Redirect URLs**:
*   Site URL: `https://detailcorner.co.za` (or your chosen primary domain)
*   Redirect URIs:
    *   `https://detailcorner.co.za/**`
    *   `http://localhost:3000/**` (Keep this for local development)

### Edge Function Secrets
The Edge Functions (`create-order`, `payfast-itn`, `send-test-email`) require strict secrets. Use the Supabase CLI (`supabase secrets set`) or the Supabase Dashboard to set these:

*   `SUPABASE_URL`: (Usually injected automatically by Supabase)
*   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (Required for atomic inventory/orders bypassing RLS).
*   `FRONTEND_URL`: Your production URL (e.g., `https://detailcorner.co.za`).
*   `PAYFAST_SANDBOX`: Set to `true` initially. Change to `false` when going live.
*   `PAYFAST_MERCHANT_ID`: Your PayFast Merchant ID.
*   `PAYFAST_MERCHANT_KEY`: Your PayFast Merchant Key.
*   `PAYFAST_PASSPHRASE`: Your PayFast Secure Passphrase.
*   `PAYFAST_NOTIFY_URL`: The full URL to your deployed `payfast-itn` edge function (e.g., `https://[PROJECT_REF].supabase.co/functions/v1/payfast-itn`).
*   `BREVO_API_KEY`: Your Brevo API v3 key.
*   `FROM_EMAIL`: The verified sender email in Brevo (e.g., `info@detailcorner.co.za`).
*   `ADMIN_EMAIL`: The email address that should receive "New Order" notifications.

## 3. Switching PayFast from Sandbox to Production

Because the architecture dynamically reads configuration, moving to production requires **zero code changes**:

1.  In your Supabase Dashboard > Edge Functions > Secrets, update:
    *   `PAYFAST_SANDBOX` = `false`
    *   `PAYFAST_MERCHANT_ID` = `[Production ID]`
    *   `PAYFAST_MERCHANT_KEY` = `[Production Key]`
    *   `PAYFAST_PASSPHRASE` = `[Production Passphrase]`
2.  The `create-order` function will automatically switch form POST targets from `sandbox.payfast.co.za` to `www.payfast.co.za`.
3.  The `payfast-itn` function will automatically validate the signature and IPN against the production PayFast verification endpoint.
