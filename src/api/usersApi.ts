import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  RawUsersDictionary,
  AdminUser,
  CreateUserRequest,
  ApiActionResponse,
  UserDashboardResponse,
  GetRolesResponse,
  DEFAULT_ENABLED_ROLES_MOCK,
  DEFAULT_DISABLED_ROLES_MOCK,
  DEFAULT_ROLE_USER_COUNT_MOCK,
  normalizeUsersDictionary,
  generateNanoId,
} from '../domains/admin/types';

/**
 * Initial fallback crew dictionary matching the Stitch User Management screens.
 * Formatted in the exact contract required by get_users / get_user_dashboard:
 * {
 *   'user_id': {
 *     'user_name': user_name,
 *     'user_email': email_address,
 *     'enabled': 'True'/'False',
 *     'roles': ['Management']
 *   }
 * }
 */
export const STITCH_INITIAL_USERS_MOCK: RawUsersDictionary = {
  'usr_8492': {
    user_name: 'Marco Rossi',
    user_email: 'm.rossi@kitchenops.io',
    enabled: 'True',
    roles: ['Operations Manager', 'Station Lead'],
  },
  'usr_3914': {
    user_name: 'Elena Rostova',
    user_email: 'e.rostova@kitchenops.io',
    enabled: 'True',
    roles: ['Operations Executive', 'Sauté Lead'],
  },
  'usr_5021': {
    user_name: 'David Kim',
    user_email: 'd.kim@kitchenops.io',
    enabled: 'True',
    roles: ['Management', 'Inventory Admin'],
  },
  'usr_7740': {
    user_name: 'Sarah Jenkins',
    user_email: 's.jenkins@kitchenops.io',
    enabled: 'True',
    roles: ['Operations Executive', 'Grill Station'],
  },
  'usr_1092': {
    user_name: 'Thomas Vance',
    user_email: 't.vance@kitchenops.io',
    enabled: 'False',
    roles: ['Operations Executive'],
  },
  'usr_6520': {
    user_name: 'Chloe Dupuis',
    user_email: 'c.dupuis@kitchenops.io',
    enabled: 'False',
    roles: ['Management'],
  },
};

const LOCAL_STORAGE_USERS_KEY = 'tsm_admin_users_dict';
const LOCAL_STORAGE_ROLES_KEY = 'tsm_admin_roles_dict';
const LOCAL_STORAGE_DISABLED_ROLES_KEY = 'tsm_admin_disabled_roles_dict';
const LOCAL_STORAGE_ROLE_USER_COUNTS_KEY = 'tsm_admin_role_user_counts_dict';

/**
 * Retrieves the enabled roles dictionary from localStorage or default mock
 */
export function getStoredRoles(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ROLES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore json error
  }
  return { ...DEFAULT_ENABLED_ROLES_MOCK };
}

/**
 * Persists the enabled roles dictionary to localStorage
 */
export function setStoredRoles(roles: Record<string, string>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ROLES_KEY, JSON.stringify(roles));
  } catch {
    // ignore storage error
  }
}

/**
 * Retrieves the disabled roles dictionary from localStorage or default mock
 */
export function getStoredDisabledRoles(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DISABLED_ROLES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {
    // ignore json error
  }
  return { ...DEFAULT_DISABLED_ROLES_MOCK };
}

/**
 * Persists the disabled roles dictionary to localStorage
 */
export function setStoredDisabledRoles(roles: Record<string, string>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_DISABLED_ROLES_KEY, JSON.stringify(roles));
  } catch {
    // ignore storage error
  }
}

/**
 * Retrieves the role user counts dictionary from localStorage or default mock
 */
export function getStoredRoleUserCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ROLE_USER_COUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {
    // ignore json error
  }
  return { ...DEFAULT_ROLE_USER_COUNT_MOCK };
}

/**
 * Persists the role user counts dictionary to localStorage
 */
export function setStoredRoleUserCounts(counts: Record<string, number>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ROLE_USER_COUNTS_KEY, JSON.stringify(counts));
  } catch {
    // ignore storage error
  }
}

/**
 * Retrieves the users dictionary from localStorage or default mock
 */
export function getStoredUsersDictionary(): RawUsersDictionary {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore json error
  }
  return STITCH_INITIAL_USERS_MOCK;
}

/**
 * Persists the raw dictionary to localStorage
 */
export function setStoredUsersDictionary(dict: RawUsersDictionary): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(dict));
  } catch {
    // ignore storage error
  }
}

/**
 * Calls api/v1/get_user_dashboard
 * Returns dashboard payload with users and role assignments.
 */
export async function getUserDashboardApi(): Promise<{
  users: AdminUser[];
  rawDictionary: RawUsersDictionary;
  dashboardData?: Record<string, any>;
  role?: string;
  logout?: boolean;
}> {
  try {
    const response = await apiClient.get<UserDashboardResponse>(
      API_ENDPOINTS.DASHBOARD.GET_USER_DASHBOARD,
      { timeout: 5000 }
    );

    const data = response.data;

    // Check logout flag
    if (data?.logout === true || data?.logout === 'True') {
      localStorage.removeItem('tsm_auth_token');
      localStorage.removeItem('tsm_user');
      window.location.href = '/login?reason=session_terminated';
      return {
        users: [],
        rawDictionary: {},
        logout: true,
      };
    }

    // Extract users dictionary: can be in data.users or data directly
    let rawDict: RawUsersDictionary = {};
    if (data?.users && typeof data.users === 'object') {
      rawDict = data.users;
    } else if (data && typeof data === 'object') {
      // Check if root has user objects
      const firstVal = Object.values(data)[0];
      if (firstVal && typeof firstVal === 'object' && 'user_name' in firstVal) {
        rawDict = data as RawUsersDictionary;
      }
    }

    if (Object.keys(rawDict).length > 0) {
      setStoredUsersDictionary(rawDict);
      const rolesMap = getStoredRoles();
      return {
        users: normalizeUsersDictionary(rawDict, rolesMap),
        rawDictionary: rawDict,
        dashboardData: data.dashboard_data,
        role: data.role || (data.roles ? data.roles[0] : undefined),
        logout: false,
      };
    }
  } catch (err) {
    console.warn('Backend get_user_dashboard offline or unreachable; using local storage/fallback:', err);
  }

  // Fallback to local stored dictionary
  const fallbackDict = getStoredUsersDictionary();
  const fallbackRoles = getStoredRoles();
  return {
    users: normalizeUsersDictionary(fallbackDict, fallbackRoles),
    rawDictionary: fallbackDict,
    role: 'Admin',
    logout: false,
  };
}

/**
 * Helper to safely extract boolean status and message from backend response
 */
function parseApiStatusResponse(data: any): { isSuccess: boolean; message: string } {
  const isSuccess =
    data?.status === true ||
    data?.status === 'True' ||
    data?.status === 'true';

  const message =
    typeof data?.message === 'string' && data.message.trim().length > 0
      ? data.message.trim()
      : typeof data?.detail === 'string' && data.detail.trim().length > 0
      ? data.detail.trim()
      : isSuccess
      ? 'Action completed successfully.'
      : 'Action failed. Please check inputs and try again.';

  return { isSuccess, message };
}

/**
 * Calls api/v1/admin/create_user
 * Request: { user_email, user_name, roles }
 * Response: { status: True/False, message: "..." }
 */
export async function createUserApi(payload: CreateUserRequest): Promise<ApiActionResponse> {
  try {
    const response = await apiClient.post<ApiActionResponse>(
      API_ENDPOINTS.ADMIN.CREATE_USER,
      payload,
      { timeout: 6000 }
    );

    const { isSuccess, message } = parseApiStatusResponse(response.data);

    if (isSuccess) {
      // Synchronize local fallback dictionary
      const currentDict = getStoredUsersDictionary();
      const nanoId = generateNanoId('usr');
      currentDict[nanoId] = {
        user_name: payload.user_name,
        user_email: payload.user_email,
        enabled: 'True',
        roles: payload.roles,
      };
      setStoredUsersDictionary(currentDict);

      return {
        status: true,
        message: message || 'User successfully provisioned.',
      };
    } else {
      // Backend returned status: False with an explanatory message
      return {
        status: false,
        message,
      };
    }
  } catch (err: any) {
    const errData = err.response?.data;
    const backendMessage =
      typeof errData?.message === 'string'
        ? errData.message
        : typeof errData?.detail === 'string'
        ? errData.detail
        : null;

    // If the backend responded with an HTTP error and message, display that failure message
    if (backendMessage) {
      return {
        status: false,
        message: backendMessage,
      };
    }

    // Only if backend server is completely offline / unreachable during local dev:
    const currentDict = getStoredUsersDictionary();
    const nanoId = generateNanoId('usr');
    currentDict[nanoId] = {
      user_name: payload.user_name,
      user_email: payload.user_email,
      enabled: 'True',
      roles: payload.roles,
    };
    setStoredUsersDictionary(currentDict);

    return {
      status: true,
      message: 'User provisioned in local offline mode (backend server unreachable).',
    };
  }
}

/**
 * Calls api/v1/admin/update_user to enable or disable a user
 * Request: { user_id, enabled } (backend ignores all other keys)
 * Response: { status: True/False, message: "..." }
 */
export async function updateUserStatusApi(
  userId: string,
  enabled: boolean
): Promise<ApiActionResponse> {
  try {
    const response = await apiClient.post<ApiActionResponse>(
      API_ENDPOINTS.ADMIN.UPDATE_USER,
      {
        user_id: userId,
        enabled,
      },
      { timeout: 6000 }
    );

    const { isSuccess, message } = parseApiStatusResponse(response.data);

    if (isSuccess) {
      const currentDict = getStoredUsersDictionary();
      if (currentDict[userId]) {
        currentDict[userId].enabled = enabled ? 'True' : 'False';
        setStoredUsersDictionary(currentDict);
      }
      return {
        status: true,
        message: message || `User status set to ${enabled ? 'Active' : 'Disabled'}.`,
      };
    } else {
      // Backend returned status: False with explanatory message
      return {
        status: false,
        message,
      };
    }
  } catch (err: any) {
    const errData = err.response?.data;
    const backendMessage =
      typeof errData?.message === 'string'
        ? errData.message
        : typeof errData?.detail === 'string'
        ? errData.detail
        : null;

    if (backendMessage) {
      return {
        status: false,
        message: backendMessage,
      };
    }

    // Offline dev fallback
    const currentDict = getStoredUsersDictionary();
    if (currentDict[userId]) {
      currentDict[userId].enabled = enabled ? 'True' : 'False';
      setStoredUsersDictionary(currentDict);
    }
    return {
      status: true,
      message: `User status set to ${enabled ? 'Active' : 'Disabled'} locally (backend unreachable).`,
    };
  }
}

/**
 * Calls api/v1/admin/update_user to edit user roles and name
 * Request: { user_id, roles, user_name } (email cannot be changed)
 * Response: { status: True/False, message: "..." }
 */
export async function updateUserDetailsApi(
  userId: string,
  payload: {
    user_name: string;
    roles: string[];
  }
): Promise<ApiActionResponse> {
  try {
    const response = await apiClient.post<ApiActionResponse>(
      API_ENDPOINTS.ADMIN.UPDATE_USER,
      {
        user_id: userId,
        user_name: payload.user_name,
        roles: payload.roles,
      },
      { timeout: 6000 }
    );

    const { isSuccess, message } = parseApiStatusResponse(response.data);

    if (isSuccess) {
      const currentDict = getStoredUsersDictionary();
      if (currentDict[userId]) {
        currentDict[userId].user_name = payload.user_name;
        currentDict[userId].roles = payload.roles;
        setStoredUsersDictionary(currentDict);
      }
      return {
        status: true,
        message: message || 'User details updated successfully.',
      };
    } else {
      // Backend returned status: False with explanatory message
      return {
        status: false,
        message,
      };
    }
  } catch (err: any) {
    const errData = err.response?.data;
    const backendMessage =
      typeof errData?.message === 'string'
        ? errData.message
        : typeof errData?.detail === 'string'
        ? errData.detail
        : null;

    if (backendMessage) {
      return {
        status: false,
        message: backendMessage,
      };
    }

    // Offline dev fallback
    const currentDict = getStoredUsersDictionary();
    if (currentDict[userId]) {
      currentDict[userId].user_name = payload.user_name;
      currentDict[userId].roles = payload.roles;
      setStoredUsersDictionary(currentDict);
    }
    return {
      status: true,
      message: 'User details updated locally (backend unreachable).',
    };
  }
}

/**
 * Calls api/v1/logout passing the token in the Authorization header
 */
export async function logoutApi(): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {}, { timeout: 3000 });
  } catch {
    // If backend offline, proceed with local logout
  } finally {
    localStorage.removeItem('tsm_auth_token');
    localStorage.removeItem('tsm_user');
  }
}

/**
 * Calls api/v1/admin/get_roles
 * Request (with JWT Bearer token in header):
 * {
 *   "role_type": "all" | "enabled" | "disabled",
 *   "user_count": true | false
 * }
 * Response:
 * {
 *   "enabled": { role_id_1: role_name_1, ... },
 *   "disabled": { role_id_4: role_name_4, ... },
 *   "user_count": { role_id_1: count_1, ... } (only if user_count: true)
 * }
 */
export async function getAdminRolesApi(
  role_type: string = 'enabled',
  user_count: boolean = false
): Promise<GetRolesResponse> {
  const requestBody: { role_type: string; user_count?: boolean } = {
    role_type,
    user_count,
  };

  try {
    const response = await apiClient.post<GetRolesResponse>(
      API_ENDPOINTS.ADMIN.GET_ROLES,
      requestBody,
      { timeout: 6000 }
    );

    if (response.data && response.data.enabled && typeof response.data.enabled === 'object') {
      setStoredRoles(response.data.enabled);
      if (response.data.disabled && typeof response.data.disabled === 'object') {
        setStoredDisabledRoles(response.data.disabled);
      }
      if (response.data.user_count && typeof response.data.user_count === 'object') {
        setStoredRoleUserCounts(response.data.user_count);
      }
      return response.data;
    }
  } catch (err) {
    // Fallback: try GET with query params if backend FastAPI router uses GET
    try {
      const getResponse = await apiClient.get<GetRolesResponse>(
        API_ENDPOINTS.ADMIN.GET_ROLES,
        {
          params: { role_type, user_count },
          timeout: 4000,
        }
      );
      if (
        getResponse.data &&
        getResponse.data.enabled &&
        typeof getResponse.data.enabled === 'object'
      ) {
        setStoredRoles(getResponse.data.enabled);
        if (getResponse.data.disabled && typeof getResponse.data.disabled === 'object') {
          setStoredDisabledRoles(getResponse.data.disabled);
        }
        if (getResponse.data.user_count && typeof getResponse.data.user_count === 'object') {
          setStoredRoleUserCounts(getResponse.data.user_count);
        }
        return getResponse.data;
      }
    } catch {
      console.warn('Backend get_roles offline or unreachable; using local roles fallback.');
    }
  }

  // Fallback to cached or mock roles
  const cachedEnabled = getStoredRoles();
  const cachedDisabled = getStoredDisabledRoles();
  const cachedUserCounts = getStoredRoleUserCounts();

  const result: GetRolesResponse = {
    enabled: cachedEnabled,
    disabled: cachedDisabled,
    status: true,
  };

  if (user_count) {
    result.user_count = cachedUserCounts;
  }

  return result;
}

/**
 * Calls api/v1/admin/create_role
 * Request: { role_name: string } with Bearer JWT
 * Response: { status: boolean, message: string }
 */
export async function createRoleApi(role_name: string): Promise<ApiActionResponse> {
  const trimmed = role_name.trim();
  try {
    const response = await apiClient.post<ApiActionResponse>(
      API_ENDPOINTS.ADMIN.CREATE_ROLE,
      { role_name: trimmed },
      { timeout: 6000 }
    );

    const { isSuccess, message } = parseApiStatusResponse(response.data);

    if (isSuccess) {
      // Synchronize local fallback state
      const enabled = getStoredRoles();
      const newId = `role_${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15)}_${generateNanoId('r')}`;
      enabled[newId] = trimmed;
      setStoredRoles(enabled);

      const counts = getStoredRoleUserCounts();
      counts[newId] = 0;
      setStoredRoleUserCounts(counts);

      return {
        status: true,
        message: message || `Role "${trimmed}" created successfully.`,
      };
    } else {
      return {
        status: false,
        message,
      };
    }
  } catch (err: any) {
    const errData = err.response?.data;
    const backendMessage =
      typeof errData?.message === 'string'
        ? errData.message
        : typeof errData?.detail === 'string'
        ? errData.detail
        : null;

    if (backendMessage) {
      return {
        status: false,
        message: backendMessage,
      };
    }

    // Dev fallback if backend offline
    const enabled = getStoredRoles();
    const newId = `role_${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15)}_${generateNanoId('r')}`;
    enabled[newId] = trimmed;
    setStoredRoles(enabled);

    const counts = getStoredRoleUserCounts();
    counts[newId] = 0;
    setStoredRoleUserCounts(counts);

    return {
      status: true,
      message: `Role "${trimmed}" created successfully in local mode.`,
    };
  }
}

/**
 * Calls api/v1/admin/disable_role
 * Request: { role_id: string } with Bearer JWT
 * Response: { status: boolean, message: string }
 */
export async function disableRoleApi(role_id: string): Promise<ApiActionResponse> {
  try {
    const response = await apiClient.post<ApiActionResponse>(
      API_ENDPOINTS.ADMIN.DISABLE_ROLE,
      { role_id },
      { timeout: 6000 }
    );

    const { isSuccess, message } = parseApiStatusResponse(response.data);

    if (isSuccess) {
      // Local sync
      const enabled = getStoredRoles();
      const disabled = getStoredDisabledRoles();
      const roleName = enabled[role_id] || role_id;
      delete enabled[role_id];
      disabled[role_id] = roleName;
      setStoredRoles(enabled);
      setStoredDisabledRoles(disabled);

      const counts = getStoredRoleUserCounts();
      counts[role_id] = 0;
      setStoredRoleUserCounts(counts);

      return {
        status: true,
        message: message || `Role "${roleName}" has been disabled.`,
      };
    } else {
      return {
        status: false,
        message,
      };
    }
  } catch (err: any) {
    const errData = err.response?.data;
    const backendMessage =
      typeof errData?.message === 'string'
        ? errData.message
        : typeof errData?.detail === 'string'
        ? errData.detail
        : null;

    if (backendMessage) {
      return {
        status: false,
        message: backendMessage,
      };
    }

    // Dev fallback
    const enabled = getStoredRoles();
    const disabled = getStoredDisabledRoles();
    const roleName = enabled[role_id] || role_id;
    delete enabled[role_id];
    disabled[role_id] = roleName;
    setStoredRoles(enabled);
    setStoredDisabledRoles(disabled);

    const counts = getStoredRoleUserCounts();
    counts[role_id] = 0;
    setStoredRoleUserCounts(counts);

    return {
      status: true,
      message: `Role "${roleName}" disabled successfully in local mode.`,
    };
  }
}

/**
 * Calls api/v1/disable/enable_role (with fallback to api/v1/admin/enable_role)
 * Request: { role_id: string } with Bearer JWT
 * Response: { status: boolean, message: string }
 */
export async function enableRoleApi(role_id: string): Promise<ApiActionResponse> {
  try {
    let response;
    try {
      response = await apiClient.post<ApiActionResponse>(
        API_ENDPOINTS.ADMIN.DISABLE_ENABLE_ROLE,
        { role_id },
        { timeout: 6000 }
      );
    } catch (firstErr: any) {
      // If 404, fallback to /admin/enable_role
      if (firstErr.response?.status === 404) {
        response = await apiClient.post<ApiActionResponse>(
          API_ENDPOINTS.ADMIN.ENABLE_ROLE,
          { role_id },
          { timeout: 6000 }
        );
      } else {
        throw firstErr;
      }
    }

    const { isSuccess, message } = parseApiStatusResponse(response.data);

    if (isSuccess) {
      const enabled = getStoredRoles();
      const disabled = getStoredDisabledRoles();
      const roleName = disabled[role_id] || role_id;
      delete disabled[role_id];
      enabled[role_id] = roleName;
      setStoredRoles(enabled);
      setStoredDisabledRoles(disabled);

      return {
        status: true,
        message: message || `Role "${roleName}" has been enabled.`,
      };
    } else {
      return {
        status: false,
        message,
      };
    }
  } catch (err: any) {
    const errData = err.response?.data;
    const backendMessage =
      typeof errData?.message === 'string'
        ? errData.message
        : typeof errData?.detail === 'string'
        ? errData.detail
        : null;

    if (backendMessage) {
      return {
        status: false,
        message: backendMessage,
      };
    }

    // Dev fallback
    const enabled = getStoredRoles();
    const disabled = getStoredDisabledRoles();
    const roleName = disabled[role_id] || role_id;
    delete disabled[role_id];
    enabled[role_id] = roleName;
    setStoredRoles(enabled);
    setStoredDisabledRoles(disabled);

    return {
      status: true,
      message: `Role "${roleName}" enabled successfully in local mode.`,
    };
  }
}
