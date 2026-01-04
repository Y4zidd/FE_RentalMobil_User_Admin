'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchAdminUsers } from '@/lib/api-admin-users';
import type { User } from './columns';
import { columns } from './columns';

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
        const users = await fetchAdminUsers({
          search,
          role: roleFilter,
          status: statusFilter
        });
        setData(users);
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
