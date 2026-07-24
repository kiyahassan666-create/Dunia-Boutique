export function formatKES(amount: number): string {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

export function convertToKES(usdPrice: number): number {
  return Math.round(usdPrice * 130);
}
