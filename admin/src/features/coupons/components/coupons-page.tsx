'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ColumnDef, Column } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/api-client';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormDatePicker } from '@/components/forms/form-date-picker';
import { FormCheckbox } from '@/components/forms/form-checkbox';
import { toast } from 'sonner';
import { useDataTable } from '@/hooks/use-data-table';
import { Input } from '@/components/ui/input';
import { CouponCellAction } from './coupon-cell-action';

type Coupon = {
  id: number;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_total?: number | null;
  max_uses?: number | null;
  used_count?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
  created_at?: string;
};

const formSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters'),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z
    .number({ invalid_type_error: 'Enter a valid number' })
    .min(1, 'Minimum 1'),
  min_order_total: z
    .number({ invalid_type_error: 'Enter a valid number' })
    .optional(),
  max_uses: z
    .number({ invalid_type_error: 'Enter a valid number' })
    .optional(),
  starts_at: z.date().optional(),
  expires_at: z.date().optional(),
  is_active: z.boolean().default(true)
});

type FormData = z.infer<typeof formSchema>;

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
    const fetchCoupons = async () => {
      try {
        const res = await apiClient.get('/api/admin/coupons');
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setCoupons(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load coupons');
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
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
        const res = await apiClient.put(
          `/api/admin/coupons/${editing.id}`,
          payload
        );
        const updated = res.data;
        setCoupons((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        toast.success('Coupon updated');
      } else {
        const res = await apiClient.post('/api/admin/coupons', payload);
        const created = res.data;
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
      await apiClient.delete(`/api/admin/coupons/${id}`);
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

  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(coupons.length / pageSize));
  const { table } = useDataTable({
    data: coupons,
    columns: couponColumns,
    pageCount,
    shallow: false,
    debounceMs: 300
  });

  return (
    <PageContainer
      scrollable
      pageTitle='Manage Coupons'
      pageDescription='Manage discount coupons for bookings (CRUD) connected to the Laravel backend.'
    >
      <Card>
        <CardHeader className='flex items-center justify-between'>
          <CardTitle>Coupons</CardTitle>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>Add Coupon</Button>
            </DialogTrigger>
            <DialogContent className='max-w-lg'>
              <DialogHeader>
                <DialogTitle>
                  {editing ? 'Edit Coupon' : 'Add Coupon'}
                </DialogTitle>
              </DialogHeader>
              <Form
                form={form}
                onSubmit={form.handleSubmit(onSubmit)}
                className='grid grid-cols-1 gap-4'
              >
                <FormInput
                  control={form.control}
                  name='code'
                  label='Code'
                  required
                />
                <FormSelect
                  control={form.control}
                  name='discount_type'
                  label='Discount Type'
                  options={[
                    { label: 'Percent (%)', value: 'percent' },
                    { label: 'Fixed (IDR)', value: 'fixed' }
                  ]}
                  required
                />
                <FormInput
                  control={form.control}
                  name='discount_value'
                  type='number'
                  label='Discount Value'
                  step={1}
                  required
                />
                <FormField
                  control={form.control}
                  name='min_order_total'
                  render={({ field }) => {
                    const displayValue =
                      field.value === undefined || field.value === null
                        ? ''
                        : new Intl.NumberFormat('id-ID').format(
                            Number(field.value) || 0
                          );
                    return (
                      <FormItem>
                        <FormLabel>Min. Order (optional)</FormLabel>
                        <FormControl>
                          <Input
                            inputMode='numeric'
                            placeholder='0'
                            value={displayValue}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const numericString = raw
                                .replace(/\./g, '')
                                .replace(/,/g, '');
                              if (!numericString) {
                                field.onChange(undefined);
                                return;
                              }
                              const numeric = Number(numericString);
                              if (Number.isNaN(numeric)) {
                                field.onChange(undefined);
                              } else {
                                field.onChange(numeric);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormInput
                  control={form.control}
                  name='max_uses'
                  type='number'
                  label='Max Uses (optional)'
                  step={1}
                />
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormDatePicker
                    control={form.control}
                    name='starts_at'
                    label='Starts At'
                    description='Start date'
                  />
                  <FormDatePicker
                    control={form.control}
                    name='expires_at'
                    label='Expires At'
                    description='Expiry date'
                  />
                </div>
                <FormCheckbox
                  control={form.control}
                  name='is_active'
                  checkboxLabel='Active'
                />
                <div className='flex gap-2 pt-2'>
                  <Button type='submit' className='flex-1'>
                    {editing ? 'Save Changes' : 'Save'}
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    className='flex-1'
                    onClick={() => {
                      setOpenDialog(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading coupons...</div>
          ) : (
            <DataTable table={table}>
              <DataTableToolbar table={table} />
            </DataTable>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
