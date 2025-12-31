'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';

import { UserFormDialog } from './user-form-dialog';

export function AddUserButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size='sm' onClick={() => setOpen(true)}>
        <IconPlus className='mr-2 h-4 w-4' /> Add User
      </Button>
      <UserFormDialog mode='create' open={open} onOpenChange={setOpen} />
    </>
  );
}
