'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconTrash,
  IconBan
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { deactivateAdminUser, deleteAdminUser } from '@/lib/api-admin-users';

import type { User } from './columns';
import { UserFormDialog } from '../user-form-dialog';

interface CellActionProps {
  data: User;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<'deactivate' | 'delete' | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);
      if (action === 'deactivate') {
        await deactivateAdminUser(data.id);
        toast.success('User deactivated successfully');
      } else if (action === 'delete') {
        await deleteAdminUser(data.id);
        toast.success('User deleted successfully');
      }
      router.refresh();
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/users/${data.id}`)}
          >
            <IconEye className='mr-2 h-4 w-4' /> Detail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <IconEdit className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setAction('deactivate');
              setOpen(true);
            }}
          >
            <IconBan className='mr-2 h-4 w-4' /> Nonaktifkan
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setAction('delete');
              setOpen(true);
            }}
          >
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserFormDialog
        mode='edit'
        open={editOpen}
        onOpenChange={setEditOpen}
        user={data}
      />
    </>
  );
};

