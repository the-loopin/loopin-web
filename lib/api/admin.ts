export type DashboardStats = Record<string, number>;

export async function getDashboardStats(): Promise<DashboardStats> {
  return {};
}

export async function getAdminUsers(): Promise<unknown[]> {
  return [];
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  void userId;
  void role;
}

export async function deactivateUser(userId: string): Promise<void> {
  void userId;
}

export async function getAdminEvents(): Promise<unknown[]> {
  return [];
}

export async function cancelEvent(eventId: string): Promise<void> {
  void eventId;
}

export async function getAdminGroups(): Promise<unknown[]> {
  return [];
}