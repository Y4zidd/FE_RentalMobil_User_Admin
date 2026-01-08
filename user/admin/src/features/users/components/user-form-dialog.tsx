'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getInitials } from '@/lib/utils';
import { DEFAULT_USER_AVATAR } from '@/lib/default-avatar';

import type { User } from './users-table/columns';
import { createAdminUser, updateAdminUser, uploadAdminUserAvatar } from '@/lib/api-admin-users';

type Mode = 'create' | 'edit' | 'view';

interface UserFormDialogProps {
  mode: Mode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
}

type UserFormState = {
  name: string;
  email: string;
  role: User['role'];
  status: User['status'];
};

export function UserFormDialog({ mode, open, onOpenChange, user }: UserFormDialogProps) {
  const isView = mode === 'view';
  const [form, setForm] = useState<UserFormState>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'Staff',
    status: user?.status ?? 'Active'
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;

    setForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'Staff',
      status: user?.status ?? 'Active'
    });
    setAvatarFile(null);
    setAvatarPreview(null);
  }, [open, user]);

  const title =
    mode === 'create' ? 'Add User' : mode === 'edit' ? 'Edit User' : 'User Details';
  const primaryLabel = mode === 'create' ? 'Create User' : 'Save Changes';

  const handleChange = (field: keyof UserFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isView) {
      return;
    }
    setLoading(true);
    try {
      const target = event.target as any;
      let currentUserId = user?.id;

      if (mode === 'create') {
        const createdUser = await createAdminUser({
          ...form,
          password: target.password?.value || 'password123',
          role: form.role.toLowerCase(),
          status: form.status.toLowerCase()
        });
        currentUserId = createdUser?.id ?? currentUserId;
        toast.success('User created successfully');
      } else {
        const payload: Record<string, unknown> = {
          ...form,
          role: form.role.toLowerCase(),
          status: form.status.toLowerCase()
        };
        const newPassword = target.resetPassword?.value;
        await updateAdminUser(user?.id, payload, newPassword);
        toast.success('User updated successfully');
      }

      if (avatarFile && currentUserId) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await uploadAdminUserAvatar(currentUserId, formData);
      }

      onOpenChange(false);
      router.refresh();
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const avatarInitials = getInitials(form.name, 'AD');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>{title}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={isView ? (event) => event.preventDefault() : handleSubmit}
          className='space-y-6'
        >
          {/* Avatar Section */}
          <div className='flex flex-col items-center gap-3 pb-4 border-b'>
            <Avatar className='h-24 w-24'>
              <AvatarImage
                src={avatarPreview || user?.avatarUrl || DEFAULT_USER_AVATAR}
                alt={form.name}
              />
              <AvatarFallback className='text-xl font-semibold bg-primary/10'>
                {avatarInitials || 'US'}
              </AvatarFallback>
            </Avatar>
            {!isView && (
              <>
                <Input
                  ref={fileInputRef}
                  id='avatar'
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleAvatarChange}
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className='text-xs'
                >
                  Change Photo
                </Button>
              </>
            )}
          </div>

          {/* Form Fields / Details */}
          {isView ? (
            <div className='space-y-6'>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>Name</p>
                <p className='text-base font-medium'>
                  {user?.name ?? form.name}
                </p>
              </div>
              <div className='grid gap-6 sm:grid-cols-2'>
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>Role</p>
                  <p className='text-base font-medium'>
                    {user?.role ?? form.role}
                  </p>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>Status</p>
                  <p className='text-base font-medium'>
                    {user?.status ?? form.status}
                  </p>
                </div>
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>Email</p>
                <p className='text-base font-medium break-all'>
                  {user?.email ?? form.email}
                </p>
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder='Full name'
                  required
                  disabled={loading}
                />
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='role'>Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(value) =>
                      handleChange('role', value as UserFormState['role'])
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id='role'>
                      <SelectValue placeholder='Select role' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Admin'>Admin</SelectItem>
                      <SelectItem value='Staff'>Staff</SelectItem>
                      <SelectItem value='Customer'>Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='status'>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      handleChange('status', value as UserFormState['status'])
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id='status'>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Active'>Active</SelectItem>
                      <SelectItem value='Inactive'>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder='user@example.com'
                  required
                  disabled={loading}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor={mode === 'create' ? 'password' : 'resetPassword'}>
                  {mode === 'create' ? 'Password' : 'New Password'}
                </Label>
                <Input
                  id={mode === 'create' ? 'password' : 'resetPassword'}
                  type='password'
                  placeholder={
                    mode === 'create'
                      ? 'Set password'
                      : 'Leave blank to keep current'
                  }
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <DialogFooter className='gap-2 pt-4 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {isView ? 'Close' : 'Cancel'}
            </Button>
            {!isView && (
              <Button type='submit' disabled={loading}>
                {loading ? 'Saving...' : primaryLabel}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
