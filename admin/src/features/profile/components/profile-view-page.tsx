'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

type AccountFormState = {
  name: string;
  email: string;
  phone: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfileViewPage() {
  const [accountForm, setAccountForm] = useState<AccountFormState>({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/api/user/data');
        const user = response.data;
        setAccountForm({
          name: user.name ?? '',
          email: user.email ?? '',
          phone: user.phone ?? ''
        });
        setAvatarPreview(user.avatar_url ?? '');
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('admin_user', JSON.stringify(user));
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAccountChange = (
    field: keyof AccountFormState,
    value: string
  ) => {
    setAccountForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (
    field: keyof PasswordFormState,
    value: string
  ) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingAccount(true);
    try {
      const payload = {
        name: accountForm.name,
        email: accountForm.email,
        phone: accountForm.phone
      };
      const response = await apiClient.put('/api/user/profile', payload);
      const user = response.data;
      setAccountForm({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? ''
      });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('admin_user', JSON.stringify(user));
      }
      toast.success('Profile updated');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error?.response?.data?.errors &&
          Object.values(error.response.data.errors)[0][0]) ||
        'Failed to update profile';
      toast.error(message);
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSavePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error('Please fill all password fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await apiClient.put('/api/user/password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        new_password_confirmation: passwordForm.confirmPassword
      });
      toast.success('Password updated');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error?.response?.data?.errors &&
          Object.values(error.response.data.errors)[0][0]) ||
        'Failed to update password';
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      toast.error('Please upload an image file');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setSavingAvatar(true);
    try {
      const response = await apiClient.post('/api/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const user = response.data;
      setAvatarPreview(user.avatar_url ?? '');
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('admin_user', JSON.stringify(user));
      }
      toast.success('Photo updated');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error?.response?.data?.errors &&
          Object.values(error.response.data.errors)[0][0]) ||
        'Failed to update photo';
      toast.error(message);
    } finally {
      setSavingAvatar(false);
      event.target.value = '';
    }
  };

  const initials = getInitials(
    accountForm.name || accountForm.email || 'Admin',
    'AD'
  );

  return (
    <PageContainer
      scrollable
      isloading={loading}
      pageTitle='Profile'
      pageDescription='Manage your admin account information and security.'
    >
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-[320px,1fr]'>
        <div className='flex flex-col gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center gap-4 p-6'>
              <div className='relative'>
                <input
                  id='avatarUpload'
                  type='file'
                  accept='image/*'
                  onChange={handleAvatarUpload}
                  className='hidden'
                />
                <Avatar className='h-20 w-20 rounded-full border bg-background'>
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt={accountForm.name} />
                  ) : null}
                  <AvatarFallback className='text-lg font-semibold'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor='avatarUpload'
                  className='absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-2 ring-background cursor-pointer'
                  title='Change photo'
                >
                  <Plus className='h-4 w-4' />
                </label>
              </div>
              <div className='min-w-0 text-left'>
                <p className='text-base font-semibold leading-tight'>
                  {accountForm.name || 'Admin User'}
                </p>
                <p className='text-xs text-muted-foreground mt-1 leading-tight'>
                  {accountForm.email || 'No email set'}
                </p>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <form onSubmit={handleSaveAccount}>
              <CardHeader className='p-6'>
                <CardTitle>Account information</CardTitle>
                <CardDescription>
                  Update your personal details used across the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-8 p-6'>
                <div className='grid gap-x-8 gap-y-6 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='name'
                      className='text-xs text-muted-foreground'
                    >
                      Full name
                    </Label>
                    <Input
                      id='name'
                      value={accountForm.name}
                      onChange={(event) =>
                        handleAccountChange('name', event.target.value)
                      }
                      placeholder='Admin name'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='email'
                      className='text-xs text-muted-foreground'
                    >
                      Email address
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      value={accountForm.email}
                      onChange={(event) =>
                        handleAccountChange('email', event.target.value)
                      }
                      placeholder='admin@example.com'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='phone'
                      className='text-xs text-muted-foreground'
                    >
                      Phone number
                    </Label>
                    <Input
                      id='phone'
                      value={accountForm.phone}
                      onChange={(event) =>
                        handleAccountChange('phone', event.target.value)
                      }
                      placeholder='Optional phone number'
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className='flex justify-end p-4'>
                <Button type='submit' disabled={savingAccount} className='px-4 py-2'>
                  Save changes
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <form onSubmit={handleSavePassword}>
              <CardHeader className='p-6'>
                <CardTitle>Change password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-8 p-6'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='currentPassword'
                    className='text-xs text-muted-foreground'
                  >
                    Current password
                  </Label>
                  <Input
                    id='currentPassword'
                    type='password'
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      handlePasswordChange(
                        'currentPassword',
                        event.target.value
                      )
                    }
                    placeholder='Enter current password'
                  />
                </div>
                <div className='grid gap-x-8 gap-y-6 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='newPassword'
                      className='text-xs text-muted-foreground'
                    >
                      New password
                    </Label>
                    <Input
                      id='newPassword'
                      type='password'
                      value={passwordForm.newPassword}
                      onChange={(event) =>
                        handlePasswordChange('newPassword', event.target.value)
                      }
                      placeholder='Enter new password'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='confirmPassword'
                      className='text-xs text-muted-foreground'
                    >
                      Confirm new password
                    </Label>
                    <Input
                      id='confirmPassword'
                      type='password'
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        handlePasswordChange(
                          'confirmPassword',
                          event.target.value
                        )
                      }
                      placeholder='Repeat new password'
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className='flex justify-end p-4'>
                <Button type='submit' disabled={savingPassword} className='px-4 py-2'>
                  Update password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
