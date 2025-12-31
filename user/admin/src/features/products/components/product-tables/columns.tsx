"use client";
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useSidebar } from '@/components/ui/sidebar';
import { Product } from '@/constants/mock-api';
import { cn } from '@/lib/utils';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Text, XCircle } from 'lucide-react';
import Image from 'next/image';
import { CellAction } from './cell-action';
import {
  CATEGORY_OPTIONS,
  STATUS_OPTIONS,
  TRANSMISSION_OPTIONS,
  FUEL_TYPE_OPTIONS,
  LOCATION_OPTIONS
} from './options';

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'photo_url',
    header: 'Image',
    cell: ({ row }) => {
      const { state } = useSidebar();
      const sizeClass =
        state === 'collapsed' ? 'h-20 w-28' : 'h-16 w-24';
      return (
        <div
          className={cn(
            'relative overflow-hidden rounded-lg bg-muted transition-all duration-200',
            sizeClass
          )}
        >
          <Image
            src={row.getValue('photo_url')}
            alt={row.original.name}
            unoptimized
            fill
            className='h-full w-full object-cover'
          />
        </div>
      );
    },
    meta: {
      label: 'Image'
    }
  },
  {
    id: 'search',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Car Name' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Product['name']>()}</div>,
    meta: {
      label: 'Car Name',
      placeholder: 'Search car...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: 'Category',
    enableColumnFilter: true,
    meta: {
      label: 'Category',
      variant: 'multiSelect',
      options: CATEGORY_OPTIONS
    }
  },
  {
    accessorKey: 'year',
    header: 'Year',
    meta: {
      label: 'Year'
    }
  },
  {
    id: 'transmission',
    accessorKey: 'transmission',
    header: 'Transmission',
    enableColumnFilter: true,
    meta: {
      label: 'Transmission',
      variant: 'multiSelect',
      options: TRANSMISSION_OPTIONS
    }
  },
  {
    id: 'fuel_type',
    accessorKey: 'fuel_type',
    header: 'Fuel Type',
    enableColumnFilter: true,
    meta: {
      label: 'Fuel Type',
      variant: 'multiSelect',
      options: FUEL_TYPE_OPTIONS
    }
  },
  {
    accessorKey: 'seating_capacity',
    header: 'Seating Capacity',
    meta: {
      label: 'Seating Capacity'
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<string>();
      
      let badgeColor = '';
      let Icon = CheckCircle2;

      switch (status?.toLowerCase()) {
        case 'available':
          badgeColor = 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent';
          Icon = CheckCircle2;
          break;
        case 'rented':
          badgeColor = 'bg-blue-500 hover:bg-blue-600 text-white border-transparent';
          Icon = XCircle;
          break;
        case 'maintenance':
          badgeColor = 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent';
          Icon = XCircle;
          break;
        default:
          badgeColor = 'bg-gray-500 hover:bg-gray-600 text-white border-transparent';
          Icon = XCircle;
      }

      return (
        <Badge className={cn('capitalize', badgeColor)}>
          <Icon className="mr-1" />
          {status}
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
    accessorKey: 'price_per_day',
    header: 'Price / Day',
    cell: ({ cell }) => {
      const amount = parseFloat(cell.getValue<string>());
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(amount);
    },
    meta: {
      label: 'Price per Day'
    }
  },
  {
    accessorKey: 'license_plate',
    header: 'License Plate',
    meta: {
      label: 'License Plate'
    }
  },
  {
    accessorKey: 'location',
    header: 'Location',
    meta: {
      label: 'Location'
    }
  },

  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
