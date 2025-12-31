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
import { Product } from '@/constants/mock-api';
import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

interface CellActionProps {
  data: Product;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);
      await apiClient.delete(`/api/admin/cars/${data.id}`);
      toast.success('Car deleted successfully');
      router.refresh();
      // Since we are client-side rendering the list, refresh() might not update the list immediately if it doesn't trigger re-fetch.
      // But typically next/navigation refresh triggers server re-render (for RSC) or re-run of hooks?
      // For client-side fetch in useEffect, we might need to reload or pass a callback.
      // A simple window.location.reload() works or assume router.refresh() does enough.
      window.location.reload(); 
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
            onClick={() => router.push(`/dashboard/cars/${data.id}`)}
          >
            <IconEye className='mr-2 h-4 w-4' /> Detail
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/cars/${data.id}/edit`)}
          >
            <IconEdit className='mr-2 h-4 w-4' /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
