// Product rule: every listing is free entry with no advertised prize.
// Historical rows keep their old values; writes and public views never use them.
export const FREE_ENTRY_TERMS = {
  entry: 'free',
  entryFee: null,
  prize: 'none',
  prizePool: null,
} as const;

export const FREE_ENTRY_NOTICE = 'Free entry only. Final Circle does not advertise cash prizes or handle money.';
export const GLOBAL_DISCLOSURE = 'Free entry only. No money handled by Final Circle. 18+.';

// Two joined players reporting a payment request closes the match and pauses
// the host automatically. No human reviews the report before this applies.
export const PAYMENT_REPORT_CATEGORY = 'payment_request';
export const PAYMENT_REPORT_THRESHOLD = 2;
export const PAYMENT_REPORT_PAUSE_DAYS = 7;
