export function hasRequiredRole(
  role: string | null | undefined,
  allowedRoles: string[],
): boolean {
  if (!role) {
    return false;
  }

  return allowedRoles.includes(role);
}