'use client';

import PageContainer from '@/components/layout/page-container';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ColumnDef, Column } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { DialogTrigger } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createAdminCoupon,
  deleteAdminCoupon,
  fetchAdminCoupons,
  updateAdminCoupon
} from '@/lib/api-admin-coupons';
import { cleanupAdminCoupons } from '@/lib/api-admin-coupons';
import { toast } from 'sonner';
import { useDataTable } from '@/hooks/use-data-table';
import { CouponCellAction } from './coupon-cell-action';
import { parseAsInteger, useQueryState } from 'nuqs';

import { useRouter } from 'next/navigation';

import type { Coupon } from '@/lib/api-admin-coupons';
import { CouponFormDialog, type CouponFormValues } from './coupon-form-dialog';
import { IconPlus } from '@tabler/icons-react';

const formSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters'),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.number().min(1, 'Minimum 1'),
  min_order_total: z.number().optional(),
  max_uses: z.number().optional(),
  starts_at: z.date().optional(),
  expires_at: z.date().optional(),
  is_active: z.boolean()
});

type FormData = CouponFormValues;

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('admin_user');
    if (!stored) {
      router.replace('/dashboard/overview');
      return;
    }
    try {
      const parsed = JSON.parse(stored) as { role?: string };
      if (!parsed.role || parsed.role.toLowerCase() !== 'admin') {
        router.replace('/dashboard/overview');
      }
    } catch {
      router.replace('/dashboard/overview');
    }
  }, [router]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      discount_type: 'percent',
      discount_value: 10,
      min_order_total: 0,
      max_uses: undefined,
      starts_at: undefined,
      expires_at: undefined,
      is_active: true
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAdminCoupons();
        setCoupons(data);
      } catch (err) {
        console.error('Failed to fetch coupons', err);
        toast.error('Failed to load coupons');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const resetForm = () => {
    setEditing(null);
    form.reset({
      code: '',
      discount_type: 'percent',
      discount_value: 10,
      min_order_total: 0,
      max_uses: undefined,
      starts_at: undefined,
      expires_at: undefined,
      is_active: true
    });
  };

  const openCreate = () => {
    resetForm();
    setOpenDialog(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    form.reset({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value ?? 0),
      min_order_total:
        coupon.min_order_total !== null && coupon.min_order_total !== undefined
          ? Number(coupon.min_order_total)
          : undefined,
      max_uses:
        coupon.max_uses !== null && coupon.max_uses !== undefined
          ? Number(coupon.max_uses)
          : undefined,
      starts_at: coupon.starts_at ? new Date(coupon.starts_at) : undefined,
      expires_at: coupon.expires_at ? new Date(coupon.expires_at) : undefined,
      is_active: Boolean(coupon.is_active)
    });
    setOpenDialog(true);
  };

  const onSubmit = async (values: FormData) => {
    const payload: any = {
      code: values.code,
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      min_order_total:
        values.min_order_total === undefined ? undefined : values.min_order_total,
      max_uses: values.max_uses === undefined ? undefined : values.max_uses,
      starts_at: values.starts_at ? values.starts_at.toISOString() : undefined,
      expires_at: values.expires_at ? values.expires_at.toISOString() : undefined,
      is_active: values.is_active
    };

    try {
      if (editing) {
        const updated = await updateAdminCoupon(editing.id, payload);
        setCoupons((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        toast.success('Coupon updated');
      } else {
        const created = await createAdminCoupon(payload);
        setCoupons((prev) => [created, ...prev]);
        toast.success('Coupon created');
      }
      setOpenDialog(false);
      resetForm();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to save coupon';
      toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteAdminCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success('Coupon deleted');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to delete coupon';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const couponColumns: ColumnDef<Coupon>[] = useMemo(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => row.index + 1
      },
      {
        accessorKey: 'code',
        header: ({ column }: { column: Column<Coupon, unknown> }) => (
          <DataTableColumnHeader column={column} title='Code' />
        ),
        meta: {
          label: 'Code',
          placeholder: 'Search coupon code...',
          variant: 'text'
        },
        enableColumnFilter: true
      },
      {
        accessorKey: 'discount_type',
        header: 'Discount Type',
        cell: ({ cell }) => {
          const v = cell.getValue<string>();
          return v === 'percent' ? 'Percent' : 'Fixed';
        }
      },
      {
        accessorKey: 'discount_value',
        header: 'Discount Value',
        cell: ({ row }) => {
          const type = row.original.discount_type;
          const value = Number(row.original.discount_value || 0);
          return type === 'percent' ? `${value}%` : new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'IDR'
          }).format(value);
        }
      },
      {
        accessorKey: 'min_order_total',
        header: 'Min. Order',
        cell: ({ cell }) => {
          const v = Number(cell.getValue<number>() || 0);
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'IDR'
          }).format(v);
        }
      },
      {
        id: 'usage',
        header: 'Usage',
        cell: ({ row }) => {
          const used = Number(row.original.used_count || 0);
          const max = row.original.max_uses;
          return max ? `${used}/${max}` : `${used} (no limit)`;
        }
      },
      {
        id: 'dateRange',
        header: 'Period',
        cell: ({ row }) => {
          const s = row.original.starts_at;
          const e = row.original.expires_at;
          const fmt = (v?: string | null) =>
            v
              ? new Date(v).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
              : '-';
          return `${fmt(s)} to ${fmt(e)}`;
        }
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ cell }) => {
          const active = Boolean(cell.getValue<boolean>());
          return (
            <Badge
              className={cn(
                'rounded-full px-3 text-xs',
                active
                  ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/40'
                  : 'bg-gray-400/15 text-gray-600 border border-gray-400/40'
              )}
            >
              {active ? 'Active' : 'Inactive'}
            </Badge>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const c = row.original;
          return (
            <CouponCellAction
              data={{ id: c.id, code: c.code }}
              onEdit={(id) => {
                const found = coupons.find((cp) => cp.id === id);
                if (found) {
                  openEdit(found);
                }
              }}
              onDeleted={(id) => {
                setCoupons((prev) => prev.filter((cp) => cp.id !== id));
              }}
            />
          );
        }
      }
    ],
    [coupons]
  );

  const pageCount = Math.max(1, Math.ceil(coupons.length / pageSize));
  const { table } = useDataTable({
    data: coupons,
    columns: couponColumns,
    pageCount,
    shallow: false,
    debounceMs: 300
  });

  const pageHeaderAction = (
    <>
      <Button onClick={openCreate} className='text-xs md:text-sm'>
        <IconPlus className='mr-2 h-4 w-4' /> Add Coupon
      </Button>
      <CouponFormDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        form={form as any}
        editing={editing}
        onSubmit={onSubmit}
        onCancel={() => {
          setOpenDialog(false);
          resetForm();
        }}
      />
    </>
  );

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Manage Coupons'
      pageDescription='Manage discount coupons for bookings'
      pageHeaderAction={pageHeaderAction}
    >
      {loading ? (
        <div>Loading coupons...</div>
      ) : (
        <DataTable table={table}>
          <DataTableToolbar table={table} />
        </DataTable>
      )}
    </PageContainer>
  );
}
