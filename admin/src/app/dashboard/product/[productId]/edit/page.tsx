import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import CarForm from '@/features/products/components/car-form';
import { fakeProducts, Product } from '@/constants/mock-api';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Edit Car'
};

type PageProps = {
  params: Promise<{
    productId: string;
  }>;
};

async function CarEditView({ productId }: { productId: string }) {
  const data = await fakeProducts.getProductById(Number(productId));
  const product = data.product as Product | undefined;

  if (!product) {
    notFound();
  }

  return <CarForm initialData={product} pageTitle='Edit Car' />;
}

export default async function Page(props: PageProps) {
  const { productId } = await props.params;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CarEditView productId={productId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}

