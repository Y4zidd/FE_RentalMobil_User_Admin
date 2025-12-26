import PageContainer from '@/components/layout/page-container';
import { AddUserButton } from '@/features/users/components/add-user-button';
import { UsersTable } from '@/features/users/components/users-table';

export const metadata = {
  title: 'Dashboard: Manage Users'
};

export default function UsersPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Manage Users'
      pageDescription='Manage admin/staff accounts or other users who have access to this dashboard.'
      pageHeaderAction={<AddUserButton />}
    >
      <UsersTable />
    </PageContainer>
  );
}


