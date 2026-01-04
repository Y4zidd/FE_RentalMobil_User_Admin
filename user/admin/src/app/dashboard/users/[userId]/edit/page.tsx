'use client';

import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserFormDialog } from '@/features/users/components/user-form-dialog';
import { fetchAdminUserById } from '@/lib/api-admin-users';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Staff' | 'Customer';
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
};

export default function Page() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await fetchAdminUserById(userId);
        setUser({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          avatarUrl: u.avatarUrl
        });
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      router.push('/dashboard/users');
    }
  };

  if (loading) {
    return <div className='p-8'>Loading user...</div>;
  }

  if (!user) {
    return (
      <PageContainer
        pageTitle='User not found'
        pageDescription='The user with this ID does not exist.'
        pageHeaderAction={
          <Link
            href='/dashboard/users'
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' })
            )}
          >
            Back to users
          </Link>
        }
      >
        <div className='p-8 text-sm text-muted-foreground'>
          User data could not be found.
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      pageTitle='Edit user'
      pageDescription='Update role and status for this user.'
      pageHeaderAction={
        <Link
          href='/dashboard/users'
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          Back
        </Link>
      }
    >
      <UserFormDialog
        mode='edit'
        open={open}
        onOpenChange={handleOpenChange}
        user={user}
      />
    </PageContainer>
  );
}
