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
 * { "status": true/false, "message": string }
 */
export interface ApiActionResponse {
  status: boolean;
  message: string;
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
 * Request payload for api/v1/admin/get_roles
 */
export interface GetRolesRequest {
  role_type?: 'enabled' | 'disabled' | string;
}

/**
 * Response payload from api/v1/admin/get_roles
 * {
 *   "enabled": {
 *     "role_id_1": "role_name_1",
 *     "role_id_2": "role_name_2"
 *   },
 *   "disabled": {}
 * }
 */
export interface GetRolesResponse {
  enabled: Record<string, string>;
  disabled?: Record<string, string>;
  status?: boolean;
  message?: string;
}

/**
 * Structure of a single role item with its ID and human-readable Name
 */
export interface RoleItem {
  id: string;
  name: string;
}

/**
 * Default fallback enabled roles dictionary for offline dev mode
 */
export const DEFAULT_ENABLED_ROLES_MOCK: Record<string, string> = {
  role_ops_mgr: 'Operations Manager',
  role_kitch_mgmt: 'Kitchen Management',
  role_station_lead: 'Station Lead',
  role_ops_exec: 'Operations Executive',
  role_saute_lead: 'Sauté Lead',
  role_grill_stn: 'Grill Station',
  role_prep_lead: 'Prep Station Lead',
  role_expediter: 'Pass Expediter',
  role_inv_spec: 'Inventory Specialist',
  role_inv_admin: 'Inventory Admin',
  role_sous_chef: 'Sous Chef',
  role_haccp_off: 'Safety & HACCP Officer',
  role_mgmt: 'Management',
  role_delivery: 'Delivery Team',
};

/**
 * List of available role names for backwards compatibility
 */
export const AVAILABLE_ROLES: string[] = Object.values(DEFAULT_ENABLED_ROLES_MOCK);

/**
 * Resolves a role ID or name to its human-readable display name using the roles dictionary
 */
export function resolveRoleName(
  roleIdOrName: string,
  rolesMap: Record<string, string> = DEFAULT_ENABLED_ROLES_MOCK
): string {
  if (rolesMap[roleIdOrName]) {
    return rolesMap[roleIdOrName];
  }
  // Check if it already is one of the role names
  const matchEntry = Object.entries(rolesMap).find(
    ([, name]) => name.toLowerCase() === roleIdOrName.toLowerCase()
  );
  if (matchEntry) {
    return matchEntry[1];
  }
  return roleIdOrName;
}

/**
 * Resolves a role name or ID to its corresponding role ID
 */
export function resolveRoleId(
  roleNameOrId: string,
  rolesMap: Record<string, string> = DEFAULT_ENABLED_ROLES_MOCK
): string {
  if (rolesMap[roleNameOrId]) {
    return roleNameOrId;
  }
  const matchEntry = Object.entries(rolesMap).find(
    ([, name]) => name.toLowerCase() === roleNameOrId.toLowerCase()
  );
  if (matchEntry) {
    return matchEntry[0];
  }
  return roleNameOrId;
}

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
export function normalizeUsersDictionary(
  dict: RawUsersDictionary,
  rolesMap: Record<string, string> = DEFAULT_ENABLED_ROLES_MOCK
): AdminUser[] {
  if (!dict || typeof dict !== 'object') return [];

  return Object.entries(dict).map(([userId, data]) => {
    const isEnabled =
      data.enabled === true ||
      data.enabled === 'True' ||
      data.enabled === 'true' ||
      data.enabled === '1';

    const rawRoles = Array.isArray(data.roles) ? data.roles : [];
    // Display roles using their mapped role names
    const displayRoles = rawRoles.map((r) => resolveRoleName(r, rolesMap));

    return {
      userId,
      userName: data.user_name || 'Unnamed Staff',
      userEmail: data.user_email || '',
      enabled: isEnabled,
      roles: displayRoles,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        data.user_name || 'Staff'
      )}&backgroundColor=1e293b,091426&textColor=ffffff`,
      station: displayRoles[0] || 'Central Kitchen #04',
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
