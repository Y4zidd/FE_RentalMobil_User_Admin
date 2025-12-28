'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn, getInitials } from '@/lib/utils';
import { DEFAULT_USER_AVATAR } from '@/lib/default-avatar';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { useParams } from 'next/navigation';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get(`/api/admin/users/${userId}`);
        const u = response.data;
        setUser({
          id: u.id,
          name: u.name,
          email: u.email,
          role:
            u.role === 'admin'
              ? 'Admin'
              : u.role === 'customer'
                ? 'Customer'
                : 'Staff',
          status: u.status === 'active' ? 'Active' : 'Inactive',
          avatarUrl: u.avatar_url || DEFAULT_USER_AVATAR
        });
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  if (loading) {
      return <div className="p-8">Loading user details...</div>;
  }

  if (!user) {
    return (
      <PageContainer
        pageTitle='User not found'
        pageDescription='The user with this ID does not exist.'
        pageHeaderAction={
          <Link
            href='/dashboard/users'
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            Back to users
          </Link>
        }
      >
        <Card>
          <CardContent className='py-10 text-center text-sm text-muted-foreground'>
            User data could not be found.
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const roleColor =
    user.role === 'Admin'
      ? 'bg-blue-500 hover:bg-blue-600 text-white border-transparent'
      : 'bg-amber-500 hover:bg-amber-600 text-white border-transparent';

  const statusVariant: 'default' | 'outline' =
    user.status === 'Active' ? 'default' : 'outline';
  const initials = getInitials(user.name, 'AD');

  return (
    <PageContainer
      pageTitle='User details'
      pageDescription='View profile information for a dashboard user.'
      pageHeaderAction={
        <Link
          href='/dashboard/users'
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          Back
        </Link>
      }
    >
      <div className='grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]'>
        <Card>
          <CardHeader className='flex flex-row items-center gap-4'>
            <Avatar className='h-14 w-14'>
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='space-y-1'>
              <CardTitle className='text-lg'>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge className={cn('rounded-full px-3 text-xs', roleColor)}>
                  {user.role}
                </Badge>
                <Badge
                  variant={statusVariant}
                  className='rounded-full px-3 text-xs'
                >
                  {user.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Account information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
              <dt className='text-muted-foreground'>Full name</dt>
              <dd className='font-medium'>{user.name}</dd>
              <dt className='text-muted-foreground'>Email</dt>
              <dd className='font-medium'>{user.email}</dd>
              <dt className='text-muted-foreground'>Role</dt>
              <dd className='font-medium'>{user.role}</dd>
              <dt className='text-muted-foreground'>Status</dt>
              <dd className='font-medium'>{user.status}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
