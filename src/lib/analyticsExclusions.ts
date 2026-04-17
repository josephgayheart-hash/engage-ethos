/**
 * User accounts excluded from platform-wide usage analytics & metrics.
 * These are typically internal/super-admin accounts whose activity would
 * skew tenant health, engagement, and adoption metrics.
 */
export const EXCLUDED_USER_IDS: string[] = [
  '02ddda61-f5d4-430b-a94c-3985e66c9ea9', // josephgayheart@gmail.com (super admin)
];

export const EXCLUDED_USER_ID_SET = new Set(EXCLUDED_USER_IDS);

export const isExcludedUser = (userId?: string | null): boolean =>
  !!userId && EXCLUDED_USER_ID_SET.has(userId);
