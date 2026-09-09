# Digital Salvage Marketplace

A lightweight, cloud-first digital marketplace built for GitHub + Netlify + Supabase.

## Architecture
- **GitHub:** source of truth and version history
- **Netlify:** Next.js web application and serverless-compatible execution
- **Supabase:** PostgreSQL, Auth and private Storage
- **AI:** deterministic, self-contained marketplace intelligence with optional isolated worker/model adapters; no commercial AI API is required by the core contract

## Important limits
A browser/serverless site cannot honestly promise perfect malware detection, one-second general intelligence, permanent 24/7 background execution, or impossible-to-copy digital files. The implementation therefore uses layered inspection, quarantine, signed access, queues, audit logs and explicit integration states. Social platforms are supported only through their official APIs and permissions.

## Netlify-safe design
Keep builds small, avoid unnecessary dependencies, do not run continuous processes inside Netlify Functions, and move scheduled/long-running work to supported scheduled functions/queues or an explicitly configured worker. Do not deploy repeatedly just to test tiny changes.

## Environment
Required public variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Privileged secrets belong only in Netlify server/function environment variables and must never be exposed to the browser.

## Current foundation
- Seller-first submission flow
- 25 parent categories / 225 generated subcategories architecture
- Private-storage model
- AI task/report foundation
- quality/security/duplicate/seller-history concepts
- moderation, sanctions and appeals foundation
- referral and royalty foundation
- encrypted-message storage model
- rental/social integration boundary
- admin upgrade/preview/version foundation
- natural-language admin command foundation

## Deployment
Connect the `main` branch of this repository to the existing Netlify project `earneffortlessly-marketplace`, configure the Supabase public variables, and let Netlify build from `npm run build`.

Before production, validate authentication, database migrations, RLS, Storage policies, privileged secrets, payment provider configuration, email delivery, and every enabled external integration.
