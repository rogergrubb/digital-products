# Digital Product Sales Template — Duplication Guide

## How It Works

```
Customer visits your site → Clicks "Buy Now" → Pays via Stripe → Redirected to download page → Gets the file
```

Zero backend. Zero accounts. Zero complexity. Just a static site + Stripe Payment Link.

---

## To Create a New Product Site

### Step 1: Stripe Setup (2 min)
1. Go to **Stripe Dashboard → Products → Add Product**
2. Set the name, description, and price
3. Go to **Payment Links → Create Payment Link**
4. Select the product, set quantity to 1
5. Set the **After payment** redirect to: `https://your-domain.com/success.html`
6. Copy the Payment Link URL

### Step 2: Customize the Site (5 min)
1. Duplicate this entire folder
2. Open `public/index.html` — edit ONLY the `CONFIG` object at the top:
   - `productName` — What you're selling
   - `tagline` — One-liner hook
   - `description` — Longer pitch
   - `price` / `originalPrice` — Pricing
   - `stripePaymentLink` — Paste your Stripe Payment Link
   - `features` — What's included (icon + title + description)
   - `testimonials` — Social proof (or set to `[]` to hide)
   - `faq` — Common questions (or set to `[]` to hide)
   - `brandName` / `brandAccentColor` — Your brand
3. Open `public/success.html` — edit the matching `CONFIG` values:
   - `downloadFile` — Path to your PDF/ZIP (e.g., `/products/my-guide.pdf`)
   - `downloadFileName` — What the file saves as on their computer

### Step 3: Add Your Product File
Drop your PDF/ZIP into `public/products/`

### Step 4: Deploy to Vercel
Import the project folder into Vercel via the Vercel dashboard.
It will auto-detect as a static site and deploy in ~30 seconds.

### Step 5: Update Stripe Redirect
Go back to your Stripe Payment Link and set the success redirect URL to:
`https://your-new-domain.vercel.app/success.html`

---

## Niche Ideas That Sell

| Niche | Product Example | Price Range |
|-------|----------------|-------------|
| HR / Management | Onboarding checklist pack | $19–39 |
| Real Estate | Buyer/seller guide templates | $14–29 |
| Fitness | 12-week training program PDF | $19–49 |
| Teaching | Lesson plan bundles | $9–29 |
| Small Business | SOP template pack | $29–79 |
| Marketing | Social media content calendar | $14–29 |
| Finance | Budget/investment worksheets | $9–29 |
| Safety/Compliance | Training certification packets | $29–99 |
| Wedding Planning | Timeline + checklist bundle | $14–39 |
| Parenting | Age-specific development guides | $9–19 |

---

## File Structure
```
digital-product-template/
├── vercel.json          ← Vercel config (don't edit)
├── public/
│   ├── index.html       ← Sales page (edit CONFIG only)
│   ├── success.html     ← Download page (edit CONFIG only)
│   └── products/
│       └── your-file.pdf  ← Your digital product
```

## Tips for Scale
- One Stripe account handles ALL your product sites
- Use a consistent brand per niche vertical (e.g., "CareerEdge" for all professional dev products)
- Start with $19–29 price points, raise as you get reviews/traffic
- Add Google Analytics snippet to track which niches perform
- Each site costs $0/month on Vercel's free tier (up to 100 sites)
