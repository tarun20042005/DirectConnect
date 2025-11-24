import type { User } from "@shared/schema";
import { queryClient } from "./queryClient";

const AUTH_KEY = "directconnect_user";

export interface AuthUser extends User {
  token: string;
}

export function saveAuthUser(user: AuthUser) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function getAuthUser(): AuthUser | null {
  const stored = localStorage.getItem(AUTH_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_KEY);
  // Clear all cached data when user logs out so next user sees fresh data
  queryClient.clear();
}

export function isOwner(user: User | null): boolean {
  return user?.role === "owner";
}

export function isTenant(user: User | null): boolean {
  return user?.role === "tenant";
}
