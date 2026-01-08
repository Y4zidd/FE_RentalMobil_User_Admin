'use client';

import PageContainer from '@/components/layout/page-container';
import { AddUserButton } from '@/features/users/components/add-user-button';
import { UsersTable } from '@/features/users/components/users-table';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('admin_user');
    if (!stored) {
      router.replace('/dashboard/overview');
      return;
    }
    try {
      const parsed = JSON.parse(stored) as { role?: string };
      if (parsed.role && parsed.role.toLowerCase() === 'admin') {
        setAllowed(true);
      } else {
        router.replace('/dashboard/overview');
      }
    } catch {
      router.replace('/dashboard/overview');
    }
  }, [router]);

  if (!allowed) {
    return null;
  }

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Manage Users'
      pageDescription='Manage admin/staff accounts or other users who have access to this dashboard.'
      pageHeaderAction={<AddUserButton />}
    >
      <UsersTable />
    </PageContainer>
  );
}

