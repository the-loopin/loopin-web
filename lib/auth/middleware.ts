export function hasRequiredRole(
  role: string | null | undefined,
  allowedRoles: string[],
): boolean {
  if (!role) {
    return false;
  }

  const normalizedRole = role.trim().toUpperCase();

  return allowedRoles.some(
    (allowedRole) =>
      allowedRole.trim().toUpperCase() === normalizedRole,
  );
}