"use client";

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useSidebar } from '@/components/ui/sidebar';
import { cn, getInitials } from '@/lib/utils';
import { DEFAULT_USER_AVATAR } from '@/lib/default-avatar';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Text } from 'lucide-react';

import { CellAction } from './cell-action';

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Staff' | 'Customer';
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
};

export const ROLE_OPTIONS = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Staff', value: 'Staff' },
  { label: 'Customer', value: 'Customer' }
];

export const STATUS_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' }
];

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'avatarUrl',
    header: 'IMAGE',
    cell: ({ row }) => {
      const { state } = useSidebar();
      const sizeClass = state === 'collapsed' ? 'h-10 w-10' : 'h-10 w-10';
      const avatarUrl = row.original.avatarUrl || DEFAULT_USER_AVATAR;
      const initials = getInitials(row.original.name, 'AD');

      return (
        <div
          className={cn(
            'flex items-center justify-center transition-all duration-200',
            sizeClass
          )}
        >
          <Avatar className='h-10 w-10 rounded-full border border-border/60'>
            <AvatarImage src={avatarUrl} alt={row.original.name} />
            <AvatarFallback className='text-xs font-medium'>
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      );
    }
  },
  {
    id: 'search',
    accessorKey: 'name',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<User['name']>()}</div>,
    meta: {
        label: 'User Name',
        placeholder: 'Search user...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: 'Role',
    cell: ({ cell }) => {
      const value = cell.getValue<User['role']>();

      let roleColor = '';
      switch (value) {
        case 'Admin':
          roleColor =
            'bg-blue-500 hover:bg-blue-600 text-white border-transparent';
          break;
        case 'Staff':
          roleColor =
            'bg-amber-500 hover:bg-amber-600 text-white border-transparent';
          break;
        case 'Customer':
          roleColor =
            'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent';
          break;
        default:
          roleColor =
            'bg-gray-500 hover:bg-gray-600 text-white border-transparent';
      }

      return (
        <Badge
          className={cn('rounded-full px-3 text-xs', roleColor)}
        >
          {value}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Role',
      variant: 'multiSelect',
      options: ROLE_OPTIONS
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => {
      const value = cell.getValue<User['status']>();
      
      let badgeColor = '';
      if (value === 'Active') {
        badgeColor = 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent';
      } else {
        badgeColor = 'bg-red-500 hover:bg-red-600 text-white border-transparent';
      }

      return (
        <Badge
          className={cn('rounded-full px-3 text-xs', badgeColor)}
        >
          {value}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: STATUS_OPTIONS
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
