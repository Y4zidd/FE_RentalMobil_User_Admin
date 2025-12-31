import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import CarViewPage from '@/features/products/components/car-view-page';

export const metadata = {
  title: 'Dashboard : Car View'
};

type PageProps = { params: Promise<{ productId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CarViewPage productId={params.productId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
