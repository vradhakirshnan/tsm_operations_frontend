import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  RawUsersDictionary,
  AdminUser,
  normalizeUsersDictionary,
} from '../domains/admin/types';

/**
 * Initial fallback crew dictionary matching the Stitch User Management screens.
 * Formatted in the exact contract required by get_users:
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
  '1': {
    user_name: 'Marco Rossi',
    user_email: 'm.rossi@kitchenops.io',
    enabled: 'True',
    roles: ['Operations Manager', 'Station Lead'],
  },
  '2': {
    user_name: 'Elena Rostova',
    user_email: 'e.rostova@kitchenops.io',
    enabled: 'True',
    roles: ['Operations Executive', 'Sauté Lead'],
  },
  '3': {
    user_name: 'David Kim',
    user_email: 'd.kim@kitchenops.io',
    enabled: 'True',
    roles: ['Management', 'Inventory Admin'],
  },
  '4': {
    user_name: 'Sarah Jenkins',
    user_email: 's.jenkins@kitchenops.io',
    enabled: 'True',
    roles: ['Operations Executive', 'Grill Station'],
  },
  '5': {
    user_name: 'Thomas Vance',
    user_email: 't.vance@kitchenops.io',
    enabled: 'False',
    roles: ['Operations Executive'],
  },
  '6': {
    user_name: 'Chloe Dupuis',
    user_email: 'c.dupuis@kitchenops.io',
    enabled: 'False',
    roles: ['Management'],
  },
};

// Local storage key for persisting state offline during development
const LOCAL_STORAGE_USERS_KEY = 'tsm_admin_users_dict';

/**
 * Retrieves the users dictionary from localStorage or default mock
 */
export function getStoredUsersDictionary(): RawUsersDictionary {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (raw) {
      return JSON.parse(raw);
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
 * Fetches all users from backend get_users API endpoint.
 * Returns normalized AdminUser[] array.
 * Falls back seamlessly to stored or mock data if backend is offline.
 */
export async function getUsersApi(): Promise<AdminUser[]> {
  try {
    // Attempt calling GET /admin/get_users (or /auth/users)
    const response = await apiClient.get<RawUsersDictionary>(
      API_ENDPOINTS.ADMIN.GET_USERS,
      { timeout: 4000 }
    );
    if (response.data && typeof response.data === 'object') {
      setStoredUsersDictionary(response.data);
      return normalizeUsersDictionary(response.data);
    }
  } catch {
    // Backend offline or endpoint not yet created: fall back to local stored/mock dictionary
  }

  const storedDict = getStoredUsersDictionary();
  return normalizeUsersDictionary(storedDict);
}

/**
 * Saves a new user or updates an existing user in the dictionary.
 */
export async function saveUserApi(
  user: Omit<AdminUser, 'userId'> & { userId?: string }
): Promise<AdminUser> {
  const currentDict = getStoredUsersDictionary();
  const userId = user.userId || String(Date.now());

  const updatedRaw = {
    user_name: user.userName,
    user_email: user.userEmail,
    enabled: user.enabled ? 'True' : 'False',
    roles: user.roles,
  };

  currentDict[userId] = updatedRaw;
  setStoredUsersDictionary(currentDict);

  try {
    await apiClient.post(API_ENDPOINTS.ADMIN.GET_USERS, {
      user_id: userId,
      ...updatedRaw,
    });
  } catch {
    // Backend offline
  }

  const [saved] = normalizeUsersDictionary({ [userId]: updatedRaw });
  return saved;
}

/**
 * Toggles a user's enabled status between 'True' and 'False'.
 */
export async function toggleUserStatusApi(
  userId: string,
  enabled: boolean
): Promise<void> {
  const currentDict = getStoredUsersDictionary();
  if (currentDict[userId]) {
    currentDict[userId].enabled = enabled ? 'True' : 'False';
    setStoredUsersDictionary(currentDict);

    try {
      await apiClient.patch(`${API_ENDPOINTS.ADMIN.GET_USERS}/${userId}`, {
        enabled: enabled ? 'True' : 'False',
      });
    } catch {
      // Backend offline
    }
  }
}
