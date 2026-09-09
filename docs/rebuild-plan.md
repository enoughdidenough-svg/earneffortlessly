# Rebuild plan

## Phase 1 — foundation
Keep the existing repository and replace only broken/placeholder surfaces. Use Supabase for durable state and Netlify for the web layer. Preserve Git history so rollback is always possible.

## Phase 2 — core marketplace
Authentication → profiles/usernames → taxonomy → products → seller submissions → private assets → moderation → marketplace → search/filtering.

## Phase 3 — commerce
Cart → order state machine → payment verification adapter → ownership → protected download → reviews/wishlist → refunds → immutable royalty ledger → referrals → manual payouts.

## Phase 4 — trust & operations
Notifications → support → reports → appeals → sanctions → permissions/moderators → audit → health/security.

## Phase 5 — advanced systems
Messaging with an accurately documented encryption model → rental integrations only where official manager-role APIs exist → social monitoring → advertising controls.

## Phase 6 — controlled automation
Persistent AI task/memory/decision records → admin command router → upgrade proposals → preview/staging → approval → release → rollback → safe diagnostics.

## Netlify credit protection
1. One production site only.
2. Git pushes are batched into meaningful commits.
3. No deploy is triggered for every exploratory edit.
4. Preview deployments are used only at verification checkpoints.
5. No always-on process is placed in Netlify Functions.
6. Heavy scanning is asynchronous and optional/configurable.
7. Storage files never enter the Git repository.
8. Expensive external integrations remain disabled until credentials and quotas are confirmed.

## Financial rule
The finance UI must not show amounts below `$0.01` as money due. Accounting remains decimal-safe and immutable; actual payout eligibility is a separate configurable threshold.

## Referral rule
A referred seller receives the configured +5% royalty bonus for their first five submissions each month; the referrer receives 2% of the referred user's qualifying royalty for life. Every event is idempotent and auditable.

## Honest AI boundary
The core engine is deterministic/self-contained and can operate without a commercial LLM. It must never claim human-level intelligence, perfect accuracy, complete internet coverage, virus-free results when scanning is unavailable, or impossible copy prevention. Where stronger analysis needs a separate worker/model/runtime, the UI reports the actual state rather than faking completion.
