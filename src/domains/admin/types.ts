/**
 * Raw user data payload as received from the backend:
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
 * Request payload for api/v1/admin/create_user
 */
export interface CreateUserRequest {
  user_email: string;
  user_name: string;
  roles: string[];
}

/**
 * Request payload for api/v1/admin/update_user (enabling/disabling user)
 */
export interface UpdateUserStatusRequest {
  user_id: string;
  enabled: boolean;
}

/**
 * Request payload for api/v1/admin/update_user (editing roles & name)
 */
export interface UpdateUserDetailsRequest {
  user_id: string;
  roles: string[];
  user_name: string;
}

/**
 * Common response from create_user and update_user APIs:
 * { "status": true/false }
 */
export interface ApiActionResponse {
  status: boolean;
  message?: string;
  logout?: boolean | string;
}

/**
 * Response payload from api/v1/get_user_dashboard
 */
export interface UserDashboardResponse {
  role?: string;
  roles?: string[];
  user_name?: string;
  user_email?: string;
  users?: RawUsersDictionary;
  dashboard_data?: Record<string, any>;
  logout?: boolean | string;
  status?: boolean;
  [key: string]: any;
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
  'Delivery Team',
] as const;

export type AvailableRole = (typeof AVAILABLE_ROLES)[number];

/**
 * Generates a nano ID style unique string for users (e.g., "usr_8492")
 */
export function generateNanoId(prefix: string = 'usr'): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${result}`;
}

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
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        data.user_name || 'Staff'
      )}&backgroundColor=1e293b,091426&textColor=ffffff`,
      station: data.roles?.[0] || 'Central Kitchen #04',
      lastUsed: isEnabled ? 'Today, 10:42 AM' : 'Inactive',
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
