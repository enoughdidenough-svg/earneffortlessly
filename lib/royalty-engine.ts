export const DEFAULT_ROYALTY_RATE = 70;
export const REFERRER_RATE = 2;
export const REFERRED_BONUS_RATE = 5;
export const REFERRED_BONUS_SUBMISSIONS = 5;

export function money(value: number | string) { return Math.round(Number(value) * 100) / 100; }
export function sellerRoyalty(gross: number, rate = DEFAULT_ROYALTY_RATE) { return money(gross * rate / 100); }
export function referralBonus(gross: number, eligible: boolean) { return eligible ? money(gross * REFERRED_BONUS_RATE / 100) : 0; }
export function referrerRoyalty(gross: number) { return money(gross * REFERRER_RATE / 100); }

export type RoyaltyStatus = 'PENDING'|'APPROVED'|'PAYABLE'|'PAID'|'HELD'|'REVERSED'|'ADJUSTED'|'DISPUTED';
