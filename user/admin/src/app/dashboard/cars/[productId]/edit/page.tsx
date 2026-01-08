import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { CarEditPage } from '@/features/cars/components/car-edit-page';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Edit Car'
};

type PageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function Page(props: PageProps) {
  const { productId } = await props.params;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CarEditPage productId={productId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
