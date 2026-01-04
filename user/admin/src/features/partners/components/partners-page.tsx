'use client';

import PageContainer from '@/components/layout/page-container';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ColumnDef, Column } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/forms/form-input';
import { FormTextarea } from '@/components/forms/form-textarea';
import { FormSelect } from '@/components/forms/form-select';
import { Input } from '@/components/ui/input';
import { useDataTable } from '@/hooks/use-data-table';
import { toast } from 'sonner';
import {
  AdminRentalPartner,
  createAdminRentalPartner,
  deleteAdminRentalPartner,
  fetchAdminRentalPartners,
  updateAdminRentalPartner
} from '@/lib/api-admin-partners';
import { parseAsInteger, useQueryState } from 'nuqs';
import type { FormOption } from '@/types/base-form';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  province: z.string().optional(),
  regency: z.string().optional(),
  address: z.string().optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive'])
});

type FormData = z.infer<typeof formSchema>;

export default function PartnersPage() {
  const [partners, setPartners] = useState<AdminRentalPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<AdminRentalPartner | null>(null);
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [provinceOptions, setProvinceOptions] = useState<FormOption[]>([]);
  const [regencyOptions, setRegencyOptions] = useState<FormOption[]>([]);
  const [provinceIdMap, setProvinceIdMap] = useState<Record<string, number>>({});

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      province: '',
      regency: '',
      address: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      status: 'active'
    }
  });

  const selectedProvince = form.watch('province');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAdminRentalPartners();
        setPartners(data);
      } catch (err) {
        toast.error('Failed to load rental partners');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchProvinces = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/regions/provinces');
        if (!res.ok) return;
        const data: { id: number; name: string }[] = await res.json();
        if (!isMounted) return;
        const idMap: Record<string, number> = {};
        const options: FormOption[] = data.map((p) => {
          const proper = p.name
            .toLowerCase()
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          idMap[proper] = p.id;
          return { value: proper, label: proper };
        });
        setProvinceIdMap(idMap);
        setProvinceOptions(options);
      } catch {}
    };
    fetchProvinces();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadRegencies = async () => {
      setRegencyOptions([]);
      form.setValue('regency', '');
      const id = provinceIdMap[selectedProvince || ''];
      if (!id) return;
      try {
        const res = await fetch(
          `http://localhost:8000/api/regions/provinces/${id}/regencies`
        );
        if (!res.ok) return;
        const data: { id: number; name: string }[] = await res.json();
        if (!isMounted) return;
        const options: FormOption[] = data.map((c) => {
          const proper = c.name
            .toLowerCase()
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          return { value: proper, label: proper };
        });
        setRegencyOptions(options);
      } catch {}
    };
    loadRegencies();
    return () => {
      isMounted = false;
    };
  }, [selectedProvince, form, provinceIdMap]);

  const resetForm = () => {
    setEditing(null);
    form.reset({
      name: '',
      province: '',
      regency: '',
      address: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      status: 'active'
    });
  };

  const openCreate = () => {
    resetForm();
    setOpenDialog(true);
  };

  const openEdit = (partner: AdminRentalPartner) => {
    setEditing(partner);
    form.reset({
      name: partner.name,
      province: partner.province ?? '',
      regency: partner.regency ?? '',
      address: partner.address ?? '',
      contact_name: partner.contact_name ?? '',
      contact_phone: partner.contact_phone ?? '',
      contact_email: partner.contact_email ?? '',
      status: partner.status
    });
    setOpenDialog(true);
  };

  const onSubmit = async (values: FormData) => {
    const payload: Partial<AdminRentalPartner> = {
      name: values.name,
      province: values.province || null,
      regency: values.regency || null,
      address: values.address || null,
      contact_name: values.contact_name || null,
      contact_phone: values.contact_phone || null,
      contact_email: values.contact_email || null,
      status: values.status
    };

    try {
      if (editing) {
        const updated = await updateAdminRentalPartner(editing.id, payload);
        setPartners((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        toast.success('Partner updated');
      } else {
        const created = await createAdminRentalPartner(payload);
        setPartners((prev) => [created, ...prev]);
        toast.success('Partner created');
      }
      setOpenDialog(false);
      resetForm();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to save partner';
      toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deactivate this partner?')) {
      return;
    }
    try {
      await deleteAdminRentalPartner(id);
      setPartners((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: 'inactive' } : p
        )
      );
      toast.success('Partner deactivated');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to deactivate partner';
      toast.error(message);
    }
  };

  const columns: ColumnDef<AdminRentalPartner>[] = useMemo(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => row.index + 1
      },
      {
        accessorKey: 'name',
        header: ({ column }: { column: Column<AdminRentalPartner, unknown> }) => (
          <DataTableColumnHeader column={column} title='Name' />
        ),
        meta: {
          label: 'Name',
          placeholder: 'Search partner name...',
          variant: 'text'
        },
        enableColumnFilter: true
      },
      {
        id: 'region',
        header: 'Region',
        cell: ({ row }) => {
          const p = row.original;
          const parts = [
            p.regency || '',
            p.province || ''
          ].filter(Boolean);
          return parts.join(', ') || '-';
        }
      },
      {
        accessorKey: 'contact_name',
        header: 'Contact',
        cell: ({ row }) => {
          const p = row.original;
          const name = p.contact_name || '-';
          const phone = p.contact_phone || '';
          return phone ? `${name} (${phone})` : name;
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ cell }) => {
          const status = cell.getValue<'active' | 'inactive'>();
          const isActive = status === 'active';
          return (
            <Badge
              className={
                isActive
                  ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/40 rounded-full px-3 text-xs'
                  : 'bg-gray-400/15 text-gray-600 border border-gray-400/40 rounded-full px-3 text-xs'
              }
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          );
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => openEdit(p)}
              >
                Edit
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => handleDelete(p.id)}
                disabled={p.status === 'inactive'}
              >
                Deactivate
              </Button>
            </div>
          );
        }
      }
    ],
    [partners]
  );

  const pageCount = Math.max(1, Math.ceil(partners.length / pageSize));
  const { table } = useDataTable({
    data: partners,
    columns,
    pageCount,
    shallow: false,
    debounceMs: 300
  });

  const pageHeaderAction = (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button onClick={openCreate}>Add Partner</Button>
      </DialogTrigger>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Edit Partner' : 'Add Partner'}
          </DialogTitle>
        </DialogHeader>
        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormInput
              control={form.control}
              name='name'
              label='Partner Name'
              required
            />
            <FormSelect
              control={form.control}
              name='status'
              label='Status'
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' }
              ]}
              required
            />
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormSelect
              control={form.control}
              name='province'
              label='Province'
              placeholder='Select province'
              options={provinceOptions}
            />
            <FormSelect
              control={form.control}
              name='regency'
              label='Regency (Kabupaten/Kota)'
              placeholder='Select regency'
              options={regencyOptions}
            />
          </div>
          <FormTextarea
            control={form.control}
            name='address'
            label='Address'
            placeholder='Full address (optional)'
            config={{
              rows: 3
            }}
          />
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormInput
              control={form.control}
              name='contact_name'
              label='Contact Name'
            />
            <FormInput
              control={form.control}
              name='contact_phone'
              label='Contact Phone'
            />
            <FormField
              control={form.control}
              name='contact_email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='example@mail.com'
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
  );

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Manage Rental Partners'
      pageDescription='Manage local rental partners (CRUD) connected to the Laravel backend.'
      pageHeaderAction={pageHeaderAction}
    >
      {loading ? (
        <div>Loading rental partners...</div>
      ) : (
        <DataTable table={table}>
          <DataTableToolbar table={table} />
        </DataTable>
      )}
    </PageContainer>
  );
}
