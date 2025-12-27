'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { User, columns } from './columns';

export function UsersTable() {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || undefined;
  const roleFilter = searchParams.get('role') || undefined;
  const statusFilter = searchParams.get('status') || undefined;

  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/api/admin/users', {
          params: {
            search,
            role: roleFilter ? roleFilter.toLowerCase() : undefined,
            status: statusFilter ? statusFilter.toLowerCase() : undefined
          }
        });
        const users = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        const mappedUsers = users.map((u: any) => {
          let role: User['role'];
          if (u.role === 'admin') {
            role = 'Admin';
          } else if (u.role === 'staff') {
            role = 'Staff';
          } else {
            role = 'Customer';
          }

          return {
            id: u.id,
            name: u.name,
            email: u.email,
            role,
            status: u.status === 'active' ? 'Active' : 'Inactive',
            avatarUrl: u.avatar_url || ''
          };
        });
        setData(mappedUsers);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, roleFilter, statusFilter]);

  const totalItems = data.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    shallow: false,
    debounceMs: 500
  });

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
