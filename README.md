# Sàn Cam Calculator 2026

Web app/PWA tính giá bán và lợi nhuận Sàn Cam cho seller TMĐT Việt Nam.

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

Điền Firebase web app config vào `.env.local`, bật Google provider trong Firebase Auth, tạo Firestore database, sau đó publish `firestore.rules`.

## Firebase collections

- `users/`
- `calculations/`
- `fee_configs/`
- `ads_reports/`
- `settings/`

Firestore query history dùng `where(userId == uid)` và `orderBy(createdAt desc)`. Nếu Firebase yêu cầu index, bấm link Firebase console trong error để tạo composite index.

## Deploy Vercel

1. Push code lên GitHub.
2. Import project vào Vercel.
3. Thêm các biến `NEXT_PUBLIC_FIREBASE_*` trong Project Settings.
4. Build command: `npm run build`.
5. Output framework preset: Next.js.

## Formula

```txt
SELL_PRICE =
(COST_PRICE + TARGET_PROFIT + VOUCHER + INFRA_FEE + PI_SHIP)
/
(1 - (FIXED_FEE_PERCENT + 6% + 5.5% + 1.5% + 1% + ADS_PERCENT + RETURN_PERCENT + OPERATION_PERCENT))
```

Voucher Xtra fee được cap `MIN(SELL_PRICE * 5.5%, 50000)`. Optional fields empty/invalid được tính là `0`.
