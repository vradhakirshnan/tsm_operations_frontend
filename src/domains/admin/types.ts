/**
 * Raw user data payload as received from the backend get_users endpoint:
 * {
 *   "user_id": {
 *     "user_name": string,
 *     "user_email": string,
 *     "enabled": "True" | "False" | boolean,
 *     "roles": string[]
 *   }
 * }
 */
export interface RawUserData {
  user_name: string;
  user_email: string;
  enabled: string | boolean;
  roles: string[];
}

export type RawUsersDictionary = Record<string, RawUserData>;

/**
 * Normalized user record for UI presentation and interactions
 */
export interface AdminUser {
  userId: string;
  userName: string;
  userEmail: string;
  enabled: boolean;
  roles: string[];
  avatarUrl?: string;
  station?: string;
  lastUsed?: string;
  createdAt?: string;
}

/**
 * Available station and kitchen role authorities in the Culinary Registry
 */
export const AVAILABLE_ROLES = [
  'Operations Manager',
  'Kitchen Management',
  'Station Lead',
  'Operations Executive',
  'Sauté Lead',
  'Grill Station',
  'Prep Station Lead',
  'Pass Expediter',
  'Inventory Specialist',
  'Inventory Admin',
  'Sous Chef',
  'Safety & HACCP Officer',
  'Management',
] as const;

export type AvailableRole = (typeof AVAILABLE_ROLES)[number];

/**
 * Normalizes backend dictionary into a sorted, structured array of AdminUser
 */
export function normalizeUsersDictionary(dict: RawUsersDictionary): AdminUser[] {
  if (!dict || typeof dict !== 'object') return [];

  return Object.entries(dict).map(([userId, data]) => {
    const isEnabled =
      data.enabled === true ||
      data.enabled === 'True' ||
      data.enabled === 'true' ||
      data.enabled === '1';

    return {
      userId,
      userName: data.user_name || 'Unnamed Staff',
      userEmail: data.user_email || '',
      enabled: isEnabled,
      roles: Array.isArray(data.roles) ? data.roles : [],
      // Standard avatar generator for consistency
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        data.user_name || 'Staff'
      )}&backgroundColor=1e293b,091426&textColor=ffffff`,
      station: data.roles?.[0] || 'Central Kitchen',
      lastUsed: isEnabled ? 'Today, Active Shift' : 'Inactive',
    };
  });
}

/**
 * Converts AdminUser back to the backend raw dictionary format
 */
export function denormalizeUsersArray(users: AdminUser[]): RawUsersDictionary {
  const dict: RawUsersDictionary = {};
  users.forEach((u) => {
    dict[u.userId] = {
      user_name: u.userName,
      user_email: u.userEmail,
      enabled: u.enabled ? 'True' : 'False',
      roles: u.roles,
    };
  });
  return dict;
}
