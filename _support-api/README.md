# Support API — Digital Products

Central support API for all digital product sites. Handles customer support requests with auto-reply emails and AI-powered resolution.

## How It Works

```
Customer clicks "?" on any product page
    → Fills out support form (name, email, issue type, message)
    → Form POSTs to this API

API does 3 things simultaneously:
    1. Sends instant auto-reply to customer
    2. Uses AI to generate a smart resolution based on product knowledge base
    3. Sends AI resolution email to customer
    4. Forwards full ticket to your Gmail (with AI response included)
```

## Deployment (Vercel)

1. Import `digital-products` repo in Vercel
2. Set **Root Directory** to `_support-api`
3. Add these **Environment Variables** in Vercel project settings:

| Variable | Where to Get It | Required? |
|----------|----------------|-----------|
| `RESEND_API_KEY` | resend.com → Dashboard → API Keys | Yes |
| `ANTHROPIC_API_KEY` | console.anthropic.com → Settings → API Keys | Yes (falls back to templates without it) |
| `OWNER_EMAIL` | Your Gmail address | Yes |
| `FROM_EMAIL` | Your verified Resend domain email, e.g. `support@leaderlaunch.co` | No (defaults to resend.dev) |

4. Deploy
5. Copy the deployment URL (e.g. `https://support-api-xyz.vercel.app`)
6. Update `supportApiUrl` in each product's CONFIG to point to `https://your-url.vercel.app/api/support`

## Resend Setup (Free Tier)

1. Sign up at [resend.com](https://resend.com)
2. Go to Dashboard → API Keys → Create
3. **Without custom domain:** emails send from `onboarding@resend.dev` (100/day free)
4. **With custom domain:** Add your domain in Resend → Domains → verify DNS → emails send from your brand

## Knowledge Base

Edit `knowledge/products.json` to add new products. Each product entry contains:
- Product name, description, price, format
- Contents list
- Common questions and answers
- The AI uses this to generate accurate, helpful responses

## Demo Mode

If API keys are missing, the API:
- Logs to console instead of sending emails
- Returns template-based responses instead of AI
- Still returns a valid ticket ID to the form
- The form still works visually

## Adding a New Product

1. Add product entry to `knowledge/products.json`
2. Redeploy the support API
3. Set `CONFIG.productSlug` in the new product's `index.html` to match the key
