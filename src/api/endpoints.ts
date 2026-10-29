export const API_ENDPOINTS = {
  AUTH: {
    USERS: '/auth/users',
    ROLES: '/auth/roles',
    GOOGLE_LOGIN: '/auth/google/login',
    GOOGLE_CALLBACK: '/auth/google/callback',
    LOGOUT: '/logout',
    ME: '/auth/me',
  },
  DASHBOARD: {
    GET_USER_DASHBOARD: '/get_user_dashboard',
  },
  ADMIN: {
    CREATE_USER: '/admin/create_user',
    UPDATE_USER: '/admin/update_user',
    GET_USERS: '/admin/get_users',
    GET_ROLES: '/admin/get_roles',
    CREATE_ROLE: '/admin/create_role',
    DISABLE_ROLE: '/admin/disable_role',
    ENABLE_ROLE: '/admin/enable_role',
    DISABLE_ENABLE_ROLE: '/disable/enable_role',
    USERS: '/auth/users',
  },
  CUSTOMERS: {
    LIST: '/customers/customers',
    CREATE: '/customers/customers',
    PINCODES: '/customers/pincodes',
    ADDRESSES: '/customers/addresses',
  },
  CATALOG: {
    ITEMS: '/catalog/items',
    MENUS: '/catalog/menus',
    ITEM_MAP: '/catalog/menu-items',
  },
  ORDERS: {
    LIST: '/orders/',
    CREATE: '/orders/',
    GET_ONE: (id: string) => `/orders/${id}`,
  },
  INDENTS: {
    LIST: '/indents/',
    CREATE: '/indents/',
    DETAILS: (id: number) => `/indents/${id}/details`,
  },
  EVENTS: {
    KITCHEN_STREAM: '/events/kitchen',
    ORDER_STREAM: (id: string) => `/events/orders/${id}`,
    BROADCAST: '/events/broadcast',
  },
  STORAGE: {
    UPLOAD: '/storage/upload',
  },
} as const;
