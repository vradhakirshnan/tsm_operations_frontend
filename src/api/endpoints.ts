export const API_ENDPOINTS = {
  AUTH: {
    USERS: '/auth/users',
    ROLES: '/auth/roles',
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
