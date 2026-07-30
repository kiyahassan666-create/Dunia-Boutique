import { Timestamp } from "firebase/firestore";

/**
 * Returns the start-of-period and end-of-period Timestamps for a given range.
 * Every order with `createdAt >= start` and `createdAt < end` falls within
 * the range. This is the single source of truth for "what counts as today"
 * and "what counts as this month" across the admin dashboard.
 */
export function getDateRangeBoundaries(
  range: "today" | "month"
): { start: Timestamp; end: Timestamp } {
  const now = new Date();

  if (range === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    return { start: Timestamp.fromDate(start), end: Timestamp.fromDate(end) };
  }

  // "month"
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  return { start: Timestamp.fromDate(start), end: Timestamp.fromDate(end) };
}

/**
 * Client-side filter: check whether an order's `createdAt` falls within
 * a given date range. Works with both Firestore Timestamp and serialised
 * { seconds, nanoseconds } shapes (e.g. from onSnapshot cache).
 */
export function orderInDateRange(
  order: any,
  range: "today" | "month"
): boolean {
  const { start, end } = getDateRangeBoundaries(range);
  const ca = order.createdAt;
  if (!ca) return false;

  // Convert to milliseconds regardless of shape
  let ms: number;
  if (typeof ca.toMillis === "function") {
    ms = ca.toMillis();
  } else if (ca.seconds != null) {
    ms = ca.seconds * 1000 + Math.floor((ca.nanoseconds || 0) / 1_000_000);
  } else if (ca instanceof Date) {
    ms = ca.getTime();
  } else {
    return false;
  }

  return ms >= start.toMillis() && ms < end.toMillis();
}

/**
 * Human-readable label for a date range, used in filter chips.
 */
export function dateRangeLabel(range: "today" | "month"): string {
  return range === "today" ? "Today" : "This Month";
}
