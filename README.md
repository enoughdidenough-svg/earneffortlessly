# Digital Salvage

A cloud-first digital salvage marketplace powered by Supabase and deployed on Netlify.

## Current foundation
- Seller-first intelligent submission workflow
- 25 parent categories + 225 generated subcategories
- Submission assets and private storage
- AI-job queue/report data model
- Quality, safety, duplicate and seller-history flag model
- Appeals, bans/suspensions and audit-ready actions
- Referrals and royalty ledger foundation
- Encrypted-message storage model
- Social-account rental foundation
- Admin upgrade/preview/version foundation
- Seller acquisition campaign foundation

## Important
The production architecture keeps publishing, pricing and financial decisions behind an admin approval gate. Automated inspection is designed as a layered pipeline rather than trusting a single model. No external AI API is required by the application contract; the AI worker is a separately deployable service that consumes `ai_tasks`.

## Deploy
Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Netlify, then connect this repository's `main` branch.