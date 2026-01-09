import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getInitials(
  nameOrEmail?: string | null,
  defaultInitials = 'U'
): string {
  if (!nameOrEmail) return defaultInitials;

  const value = nameOrEmail.includes('@')
    ? nameOrEmail.split('@')[0]
    : nameOrEmail;

  const parts = value.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (
    (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')
  ).toUpperCase();
}
