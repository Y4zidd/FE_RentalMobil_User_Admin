'use client';

import PageContainer from '@/components/layout/page-container';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ColumnDef, Column } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  AdminRentalPartner,
  createAdminRentalPartner,
  deleteAdminRentalPartner,
  fetchAdminRentalPartners,
  updateAdminRentalPartner
} from '@/lib/api-admin-partners';
import {
  fetchAdminRegionsProvinces,
  fetchAdminRegionsRegenciesByProvince
} from '@/lib/api-admin-regions';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useRouter } from 'next/navigation';
import type { FormOption } from '@/types/base-form';
import { IconBan, IconDotsVertical, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { PartnerFormDialog } from './partner-form-dialog';
import { PartnerDetailDialog } from './partner-detail-dialog';

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
  const router = useRouter();
  const [partners, setPartners] = useState<AdminRentalPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<AdminRentalPartner | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] =
    useState<AdminRentalPartner | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPartner, setDetailPartner] =
    useState<AdminRentalPartner | null>(null);
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [provinceOptions, setProvinceOptions] = useState<FormOption[]>([]);
  const [regencyOptions, setRegencyOptions] = useState<FormOption[]>([]);
  const [provinceIdMap, setProvinceIdMap] = useState<Record<string, number>>({});

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
        const data = await fetchAdminRegionsProvinces();
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
        const data = await fetchAdminRegionsRegenciesByProvince(id);
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

  const handleDeactivate = async () => {
    if (!selectedPartner) return;
    try {
      setDeactivating(true);
      await updateAdminRentalPartner(selectedPartner.id, { status: 'inactive' });
      setPartners((prev) =>
        prev.map((p) =>
          p.id === selectedPartner.id ? { ...p, status: 'inactive' } : p
        )
      );
      toast.success('Partner deactivated');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to deactivate partner';
      toast.error(message);
    } finally {
      setDeactivating(false);
      setConfirmOpen(false);
      setSelectedPartner(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedPartner) return;
    try {
      setDeleting(true);
      await deleteAdminRentalPartner(selectedPartner.id);
      setPartners((prev) => prev.filter((p) => p.id !== selectedPartner.id));
      toast.success('Partner deleted');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to delete partner';
      toast.error(message);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setSelectedPartner(null);
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
                  onClick={() => {
                    setDetailPartner(p);
                    setDetailOpen(true);
                  }}
                >
                  <IconEye className='mr-2 h-4 w-4' /> Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEdit(p)}>
                  <IconEdit className='mr-2 h-4 w-4' /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPartner(p);
                    setConfirmOpen(true);
                  }}
                  disabled={p.status === 'inactive'}
                >
                  <IconBan className='mr-2 h-4 w-4' /> Deactivate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPartner(p);
                    setDeleteOpen(true);
                  }}
                >
                  <IconTrash className='mr-2 h-4 w-4' /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      }
    ],
    [partners, openEdit]
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
    <PartnerFormDialog
      open={openDialog}
      onOpenChange={setOpenDialog}
      onOpenCreate={openCreate}
      form={form as any}
      editing={editing}
      provinceOptions={provinceOptions}
      regencyOptions={regencyOptions}
      onSubmit={onSubmit}
      onCancel={() => {
        setOpenDialog(false);
        resetForm();
      }}
    />
  );

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Manage Rental Partners'
      pageDescription='Manage local rental partners.'
      pageHeaderAction={pageHeaderAction}
    >
      {loading ? (
        <div>Loading rental partners...</div>
      ) : (
        <>
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Deactivate this partner?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  The partner will be marked as inactive and can no longer be used for new bookings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deactivating}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeactivate}
                  disabled={deactivating}
                >
                  Deactivate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete this partner?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The partner will be permanently removed from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <PartnerDetailDialog
            open={detailOpen}
            onOpenChange={setDetailOpen}
            partner={detailPartner}
          />

          <DataTable table={table}>
            <DataTableToolbar table={table} />
          </DataTable>
        </>
      )}
    </PageContainer>
  );
}
