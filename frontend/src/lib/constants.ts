import type { Role } from '@/context/AuthContext';

/** Must match backend config.defaultPassword */
export const DEFAULT_PASSWORD = 'password123';

/** Default landing page after login by role */
export function homeRoute(role?: Role | null): string {
  if (role === 'farmer') return '/app/weather';
  if (role === 'buyer') return '/app/marketplace';
  return '/app/dashboard';
}

/** Session flag: show farmer alert popup once after login */
export const FARMER_LOGIN_ALERTS_KEY = 'agriconnect_show_farmer_alerts';

export function queueFarmerLoginAlerts(role?: Role | null) {
  if (role === 'farmer') {
    sessionStorage.setItem(FARMER_LOGIN_ALERTS_KEY, '1');
  }
}
