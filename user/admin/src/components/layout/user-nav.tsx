'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL;

type CurrentUser = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

export function UserNav() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (typeof window === 'undefined') return;
      const stored = window.localStorage.getItem('admin_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser({
            name: parsed.name ?? '',
            email: parsed.email ?? '',
            avatarUrl: parsed.avatar_url ?? ''
          });
          return;
        } catch {
        }
      }

      try {
        const response = await apiClient.get('/api/user/data');
        const user = response.data;
        const mapped: CurrentUser = {
          name: user.name ?? '',
          email: user.email ?? '',
          avatarUrl: user.avatar_url ?? ''
        };
        setCurrentUser(mapped);
        window.localStorage.setItem('admin_user', JSON.stringify(user));
      } catch {
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/admin/logout');
    } catch (error) {
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    toast.success('Logged out successfully');
    if (typeof window !== 'undefined' && USER_APP_URL) {
      window.location.href = `${USER_APP_URL}?logout=1`;
      return;
    }
    router.push('/auth/sign-in');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <UserAvatarProfile user={currentUser} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-56'
        align='end'
        sideOffset={10}
        forceMount
      >
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>
              {currentUser?.name || 'Admin'}
            </p>
            <p className='text-muted-foreground text-xs leading-none'>
              {currentUser?.email || 'admin@example.com'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
