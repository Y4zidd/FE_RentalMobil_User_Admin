'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
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

import type { User } from './users-table/columns';

type Mode = 'create' | 'edit';

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
  const [form, setForm] = useState<UserFormState>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'Staff',
    status: user?.status ?? 'Active'
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'Staff',
      status: user?.status ?? 'Active'
    });
  }, [open, user]);

  const title = mode === 'create' ? 'Add user' : 'Edit user';
  const primaryLabel = mode === 'create' ? 'Save user' : 'Save changes';

  const handleChange = (field: keyof UserFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
        if (mode === 'create') {
            await apiClient.post('/api/admin/users', {
                ...form,
                password: (event.target as any).password?.value || 'password123', // Default or from input
                role: form.role.toLowerCase(), // Backend expects lowercase probably? Enum: admin, staff, customer
                status: form.status.toLowerCase()
            });
            toast.success('User created successfully');
        } else {
            await apiClient.put(`/api/admin/users/${user?.id}`, {
                ...form,
                role: form.role.toLowerCase(),
                status: form.status.toLowerCase()
            });
            toast.success('User updated successfully');
        }
        onOpenChange(false);
        router.refresh();
        // Since router.refresh might not trigger re-fetch in client component UsersTable immediately if it uses internal state, 
        // ideally we should pass a callback `onSuccess` to this dialog to trigger table refresh.
        // But for now router.refresh() is a good start, or window.location.reload() if desperate.
        // Let's rely on router.refresh() or assume the user will reload.
        window.location.reload(); // Force reload to see changes in client-side fetched table
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
      <DialogContent className='max-w-3xl p-6 sm:p-8'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='mt-4 space-y-6'>
          <div className='grid gap-6 md:grid-cols-[auto,1fr]'>
            <div className='flex flex-col items-center gap-4'>
              <Avatar className='h-24 w-24 rounded-full border bg-background shadow-sm'>
                {user?.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={form.name} />
                )}
                <AvatarFallback className='text-lg font-semibold'>
                  {avatarInitials || 'US'}
                </AvatarFallback>
              </Avatar>
              <Button type='button' variant='outline' size='sm' disabled>
                Change photo (coming soon)
              </Button>
            </div>

            <div className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-1.5'>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    id='name'
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder='Full user name'
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='role'>Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(value) =>
                      handleChange('role', value as UserFormState['role'])
                    }
                  >
                    <SelectTrigger id='role'>
                      <SelectValue placeholder='Select role' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Admin'>Admin</SelectItem>
                      <SelectItem value='Staff'>Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder='user@carrental.com'
                  required
                />
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-1.5'>
                  <Label htmlFor='status'>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      handleChange('status', value as UserFormState['status'])
                    }
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

                {mode === 'create' && (
                  <div className='space-y-1.5'>
                    <Label htmlFor='password'>Initial password</Label>
                    <Input
                      id='password'
                      type='password'
                      placeholder='Set a temporary password'
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className={cn('border-t pt-4 mt-2 gap-2')}>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit'>{primaryLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
