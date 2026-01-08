'use client';

/**
 * Fully client-side hook for filtering navigation items based on RBAC
 *
 * This hook uses Clerk's client-side hooks to check permissions, roles, and organization
 * without any server calls. This is perfect for navigation visibility (UX only).
 *
 * Performance:
 * - All checks are synchronous (no server calls)
 * - Instant filtering
 * - No loading states
 * - No UI flashing
 *
 * Note: For actual security (API routes, server actions), always use server-side checks.
 * This is only for UI visibility.
 */

import { useMemo } from 'react';
import type { NavItem } from '@/types';

/**
 * Hook to filter navigation items based on RBAC (fully client-side)
 *
 * @param items - Array of navigation items to filter
 * @param currentRole - Optional current user role (e.g. "admin" | "staff")
 * @returns Filtered items
 */
export function useFilteredNavItems(items: NavItem[], currentRole?: string | null) {
  const filteredItems = useMemo(() => {
    let role: string | null = currentRole ?? null;

    if (!role && typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('admin_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { role?: string };
          role = parsed.role ?? null;
        } catch {
          role = null;
        }
      }
    }

    const normalizedRole = role ? role.toLowerCase() : null;

    const filterItems = (nodes: NavItem[]): NavItem[] => {
      return nodes
        .map((item) => {
          const children = item.items ? filterItems(item.items) : [];
          const access = item.access;

          let allowed = true;

          if (access?.role) {
            const requiredRole = access.role.toLowerCase();
            if (!normalizedRole) {
              allowed = false;
            } else {
              allowed = normalizedRole === requiredRole;
            }
          }

          if (!allowed && children.length === 0) {
            return null;
          }

          return {
            ...item,
            items: children
          };
        })
        .filter(Boolean) as NavItem[];
    };

    return filterItems(items);
  }, [items]);

  return filteredItems;
}
