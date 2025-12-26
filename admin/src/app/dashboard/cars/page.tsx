import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import CarListingPage from '@/features/products/components/car-listing';
import { searchParamsCache, serialize } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Manage Cars'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;

  searchParamsCache.parse(searchParams);

  // const key = serialize({ ...searchParams });

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Manage Cars'
      pageDescription='Manage cars (server-side table functionalities, to be connected to Laravel API).'
      pageHeaderAction={
        <Link
          href='/dashboard/cars/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <IconPlus className='mr-2 h-4 w-4' /> Add Car
        </Link>
      }
    >
      <Suspense
        // key={key}
        fallback={
          <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
        }
      >
        <CarListingPage />
      </Suspense>
    </PageContainer>
  );
}

