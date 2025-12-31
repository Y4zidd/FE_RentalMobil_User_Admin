'use client';

import PageContainer from '@/components/layout/page-container';
import { useTheme } from 'next-themes';

export default function TeamPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
    >
      <div
        className={`rounded-lg border bg-card p-6 text-sm ${
          isDark ? 'border-zinc-800' : ''
        }`}
      >
        <p className='text-muted-foreground'>
          This used to render Clerk&apos;s OrganizationProfile. Replace this with
          your own team management UI (members, roles, permissions) backed by
          Laravel.
        </p>
      </div>
    </PageContainer>
  );
}
