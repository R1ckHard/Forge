// Local API. iOS Simulator → localhost. Physical device → your Mac LAN IP.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:4040';
