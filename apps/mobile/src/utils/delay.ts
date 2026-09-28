/** Fixed demo delay used across splash / chat / paywall. */
export const DEMO_DELAY_MS = 2000;

export function delay(ms: number = DEMO_DELAY_MS) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
