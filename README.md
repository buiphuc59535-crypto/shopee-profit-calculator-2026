# Shopee Profit Calculator 2026

Web app/PWA tinh gia ban va loi nhuan Shopee cho seller TMĐT Viet Nam.

## Stack

- NextJS 15, TypeScript, TailwindCSS 4
- Shadcn-style reusable UI components
- Firebase Auth Google Login, Firestore realtime
- ExcelJS, jsPDF, Recharts, Framer Motion
- next-pwa, Vercel deploy

## Setup local

```bash
npm install
copy .env.example .env.local
npm run dev
```

Dien Firebase web app config vao `.env.local`, bat Google provider trong Firebase Auth, tao Firestore database, sau do publish `firestore.rules`.

## Firebase collections

- `users/`
- `calculations/`
- `fee_configs/`
- `ads_reports/`
- `settings/`

Firestore query history dung `where(userId == uid)` va `orderBy(createdAt desc)`. Neu Firebase yeu cau index, bam link Firebase console trong error de tao composite index.

## Deploy Vercel

1. Push code len GitHub.
2. Import project vao Vercel.
3. Add cac bien `NEXT_PUBLIC_FIREBASE_*` trong Project Settings.
4. Build command: `npm run build`.
5. Output framework preset: Next.js.

## Formula

```txt
SELL_PRICE =
(COST_PRICE + TARGET_PROFIT + VOUCHER + INFRA_FEE + PI_SHIP)
/
(1 - (FIXED_FEE_PERCENT + 6% + 5.5% + 1.5% + 1% + ADS_PERCENT + RETURN_PERCENT + OPERATION_PERCENT))
```

Voucher Xtra fee duoc cap `MIN(SELL_PRICE * 5.5%, 50000)`. Optional fields empty/invalid duoc tinh la `0`.
