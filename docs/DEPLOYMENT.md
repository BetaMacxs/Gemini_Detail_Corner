# Detail Corner Deployment & Production Readiness Guide (Netlify + Supabase)

## 1. Netlify Production Configuration (`https://detailcorner.netlify.app`)

The React SPA is deployed on Netlify with full SPA client-side routing support (`netlify.toml` and `public/_redirects`).

### Netlify Build Settings
*   **Build command**: `npm run build`
*   **Publish directory**: `dist`
*   **Node Version**: 18+ or 20+

### Required Netlify Environment Variables
Set the following under **Site configuration > Environment variables** in your Netlify dashboard:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase Project URL | `https://gllpmefitusfsuzrjgtf.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Public / Anon API Key | `sb_publishable_...` |
| `VITE_FRONTEND_URL` | Production App URL | `https://detailcorner.netlify.app` (or custom domain `https://detailcorner.co.za`) |
| `VITE_PAYFAST_SANDBOX` | Client Fallback Sandbox Flag | `true` (test) or `false` (live) |
| `VITE_PAYFAST_MERCHANT_ID` | PayFast Merchant ID (Client fallback) | `10046865` |
| `VITE_PAYFAST_MERCHANT_KEY` | PayFast Merchant Key (Client fallback) | `vpnx7bcoh2xa9` |
| `VITE_PAYFAST_NOTIFY_URL` | PayFast ITN Webhook endpoint | `https://gllpmefitusfsuzrjgtf.supabase.co/functions/v1/payfast-itn` |

*Security Note: Secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `PAYFAST_PASSPHRASE`, `BREVO_API_KEY`) must NEVER be added to Netlify variables. They are stored securely in Supabase Edge Function Secrets.*

---

## 2. Supabase Configuration

### Authentication Redirect URLs
In Supabase Dashboard under **Authentication > URL Configuration**:
*   **Site URL**: `https://detailcorner.netlify.app`
*   **Additional Redirect URLs**:
    *   `https://detailcorner.netlify.app/**`
    *   `https://detailcorner.co.za/**` (If using custom domain)
    *   `http://localhost:3000/**` (For local/preview testing)

### Edge Function Secrets
Set using Supabase CLI (`supabase secrets set KEY=VALUE`) or via Supabase Dashboard (**Edge Functions > Secrets**):

| Secret | Description | Value |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Auto-injected or project URL | `https://gllpmefitusfsuzrjgtf.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key for administrative operations | `eyJhbGci...` |
| `FRONTEND_URL` | Base URL for transactional email links | `https://detailcorner.netlify.app` |
| `PAYFAST_SANDBOX` | Toggle PayFast live vs test environment | `true` (test) or `false` (live) |
| `PAYFAST_MERCHANT_ID` | PayFast Merchant ID | e.g. `10046865` |
| `PAYFAST_MERCHANT_KEY` | PayFast Merchant Key | e.g. `vpnx7bcoh2xa9` |
| `PAYFAST_PASSPHRASE` | PayFast MD5 Security Passphrase | Configured in PayFast console |
| `PAYFAST_NOTIFY_URL` | Webhook URL | `https://gllpmefitusfsuzrjgtf.supabase.co/functions/v1/payfast-itn` |
| `BREVO_API_KEY` | Brevo v3 Transactional Email API Key | `xkeysib-...` |
| `FROM_EMAIL` | Verified sender email | e.g. `andrews.ashley@outlook.com` |
| `FROM_NAME` | Sender display name | `Detail Corner` |
| `ADMIN_EMAIL` | Destination for staff order alerts | e.g. `khangadijah87@gmail.com` |

---

## 3. Standardized Order Numbering Format

*   **Online Web Orders**: `DC-YYYYMMDD-X` (e.g. `DC-20260815-1`, `DC-20260815-2`). Generated atomically via PostgreSQL function `public.generate_order_number()`.
*   **In-Store POS Orders**: `POS-YYYYMMDD-X` (e.g. `POS-20260815-1`). Generated atomically via PostgreSQL function `public.generate_pos_order_number()`.

All order lookups, receipts, emails, and tracking queries support both standard prefixes seamlessly.

---

## 4. Switching PayFast to Live Production

To transition from Sandbox testing to Live production:
1. In Supabase Dashboard (**Edge Functions > Secrets**), set:
   * `PAYFAST_SANDBOX=false`
   * `PAYFAST_MERCHANT_ID=<Your_Live_Merchant_ID>`
   * `PAYFAST_MERCHANT_KEY=<Your_Live_Merchant_Key>`
   * `PAYFAST_PASSPHRASE=<Your_Live_Passphrase>`
2. In Netlify Environment Variables:
   * Set `VITE_PAYFAST_SANDBOX=false`
   * Set `VITE_PAYFAST_MERCHANT_ID=<Your_Live_Merchant_ID>`
   * Set `VITE_PAYFAST_MERCHANT_KEY=<Your_Live_Merchant_Key>`
3. Trigger a redeploy on Netlify.

