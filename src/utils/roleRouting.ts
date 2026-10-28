/**
 * Maps user roles to their designated operational dashboard:
 * - Admin -> /admin/users
 * - Operations Manager -> /ops/manager
 * - Operations Executive -> /kitchen
 * - Management -> /reconciliation
 * - Delivery Team -> /dispatch
 */
export function getDashboardRouteForRoles(roles: string[] | string | undefined): string {
  const roleList: string[] = Array.isArray(roles)
    ? roles
    : typeof roles === 'string'
    ? [roles]
    : [];

  const normalized = roleList.map((r) => r.toLowerCase().trim());

  if (normalized.some((r) => r.includes('admin'))) {
    return '/admin/users';
  }
  if (normalized.some((r) => r === 'operations manager' || (r.includes('manager') && !r.includes('management')))) {
    return '/ops/manager';
  }
  if (normalized.some((r) => r === 'management')) {
    return '/reconciliation';
  }
  if (normalized.some((r) => r.includes('delivery') || r.includes('dispatch'))) {
    return '/dispatch';
  }
  if (normalized.some((r) => r.includes('executive') || r.includes('lead') || r.includes('chef') || r.includes('cook'))) {
    return '/kitchen';
  }

  return '/admin/users';
}
