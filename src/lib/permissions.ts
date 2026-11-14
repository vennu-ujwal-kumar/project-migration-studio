export type AppRole = "admin" | "user";

export function canAccessAdmin(role: AppRole | null | undefined): boolean {
  return role === "admin";
}