'use client';

import PageContainer from '@/components/layout/page-container';
import { useTheme } from 'next-themes';

export default function WorkspacesPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
    >
      <div
        className={`rounded-lg border bg-card p-6 text-sm ${
          isDark ? 'border-zinc-800' : ''
        }`}
      >
        <p className='text-muted-foreground'>
          This used to render Clerk&apos;s OrganizationList. You can replace it
          with your own workspace management UI backed by Laravel.
        </p>
      </div>
    </PageContainer>
  );
}
