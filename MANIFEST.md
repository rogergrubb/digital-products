# Digital Products — Master Manifest

> **Claude: Always read this file first when the user asks to modify, add, remove, or check on any product or the homepage.**

## Repo Structure
```
digital-products/
├── MANIFEST.md              ← THIS FILE (master index)
├── command-center.jsx       ← Founder dashboard (React artifact)
├── _template/               ← Master template (duplicate for new products)
│   ├── SPEC-TEMPLATE.md     ← Mandatory spec sheet (fill BEFORE building)
│   ├── public/
│   │   ├── index.html       ← Sales page (edit CONFIG only)
│   │   ├── success.html     ← Download page (edit CONFIG only)
│   │   └── products/        ← Drop PDF/ZIP here
│   └── vercel.json
├── _storefront/             ← Central hub page (leaderlaunch.co)
│   ├── public/
│   │   └── index.html       ← Storefront with product catalog
│   └── vercel.json
├── _support-api/            ← Centralized support system
│   ├── api/support.js       ← Serverless function
│   ├── knowledge/products.json ← AI knowledge base
│   ├── package.json
│   └── vercel.json
├── [product-slug]/          ← One folder per product
│   ├── SPEC.md              ← Product spec sheet
│   ├── public/
│   │   ├── index.html
│   │   ├── success.html
│   │   └── products/
│   │       └── [file.pdf]
│   └── vercel.json
└── ...
```

## Vercel Projects (3 types)

| Project | Root Directory | Purpose |
|---------|---------------|---------|
| Storefront | `_storefront` | Central hub at leaderlaunch.co |
| Support API | `_support-api` | Serverless support endpoint (needs env vars) |
| Each product | `[product-slug]` | Individual product sales pages |

---

## Product Registry

| # | Slug | Product Name | Brand | Price | Stripe Product ID | Stripe Price ID | Payment Link | Vercel URL | Status |
|---|------|-------------|-------|-------|-------------------|-----------------|--------------|------------|--------|
| 1 | `new-manager-kit` | The New Manager's 90-Day Kit | LeaderLaunch | $29 | prod_Txyc3z80uM5ref | price_1T02f8Q32c2nzfSVq4hgzhaG | [link](https://buy.stripe.com/7sYaEZ8YE15r6HY3qgaIM03) | _pending_ | ✅ Built |
| 2 | `homebuyer-checklist` | First-Time Homebuyer Checklist Kit | LeaderLaunch | $19 | — | — | — | — | 🔲 Queued |
| 3 | `sop-template-pack` | Small Business SOP Template Pack | LeaderLaunch | $39 | — | — | — | — | 🔲 Queued |
| 4 | `wedding-planning-kit` | Wedding Planning Timeline & Checklist | LeaderLaunch | $14 | — | — | — | — | 🔲 Queued |
| 5 | `osha-safety-guide` | OSHA Safety Training Quick-Reference | LeaderLaunch | $29 | — | — | — | — | 🔲 Queued |
| 6 | `airbnb-host-kit` | Airbnb Host Startup Kit | LeaderLaunch | $29 | — | — | — | — | 🔲 Queued |
| 7 | `listing-presentation` | Real Estate Listing Presentation Templates | LeaderLaunch | $39 | — | — | — | — | 🔲 Queued |
| 8 | `freelancer-onboarding` | Freelancer Client Onboarding Pack | LeaderLaunch | $19 | — | — | — | — | 🔲 Queued |
| 9 | `sub-teacher-plans` | Substitute Teacher Plan Template Bundle | LeaderLaunch | $14 | — | — | — | — | 🔲 Queued |
| 10 | `rental-inspection-kit` | Rental Property Inspection Checklist Kit | LeaderLaunch | $19 | — | — | — | — | 🔲 Queued |

---

## Quick Reference — Common Operations

### "Change the price on [product]"
1. Find product in registry above → get Stripe Price ID
2. Create new Stripe price, update payment link
3. Edit `public/index.html` CONFIG → `price` and `originalPrice`
4. Push to git

### "Remove a product"
1. Find product in registry → update status to ❌ Removed
2. Delete or archive the folder
3. Deactivate the Stripe product and payment link
4. Remove Vercel project if deployed

### "Add a new product"
1. Duplicate `_template/` → rename to product slug
2. Build PDF, place in `public/products/`
3. Create Stripe product + price + payment link
4. Edit both CONFIG blocks in index.html and success.html
5. Add row to registry above
6. Push to git
7. Import in Vercel with root directory = product slug

### "Update the homepage/sales page"
1. Find product slug in registry
2. Edit `[slug]/public/index.html` CONFIG section
3. Push to git → Vercel auto-deploys

### "Update the storefront"
1. Edit `_storefront/public/index.html` → STORE.products array
2. Push to git → Vercel auto-deploys
3. Product URLs in storefront must match deployed Vercel URLs

### "Add product to support system"
1. Add product entry to `_support-api/knowledge/products.json`
2. Push to git → support API redeploys
3. Set `CONFIG.productSlug` in product's index.html to match the key

### "Update the download file"
1. Replace file in `[slug]/public/products/`
2. Update `downloadFile` and `downloadFileName` in `[slug]/public/success.html` CONFIG if filename changed
3. Push to git

---

## Brand Registry

| Brand Name | Accent Color | Dark Color | Contact Email | Used By Products |
|-----------|-------------|-----------|--------------|-----------------|
| LeaderLaunch | #c8973e | #0f2b46 | support@leaderlaunch.co | new-manager-kit |
| CareerEdge | #D4A853 | #1a1a2e | support@example.com | _(template default)_ |

---

## Stripe Account Notes
- All products share one Stripe account
- Payment links redirect to `https://[domain]/success.html` after purchase
- Demo template product: prod_TxsJYD6wCIbmEp / price_1SzwZ3Q32c2nzfSVCX5d0c2d (can be cleaned up)
