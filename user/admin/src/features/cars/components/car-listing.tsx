'use client';

import { Product, fakeProducts } from '@/constants/mock-api';
import { ProductTable } from './product-tables';
import { columns } from './product-tables/columns';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CarListingPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const pageLimit = Number(searchParams.get('perPage')) || 10;
  const search = searchParams.get('search') || undefined;
  const categories = searchParams.get('category') || undefined;

  const [data, setData] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await fakeProducts.getProducts({
          page,
          limit: pageLimit,
          search,
          categories
        });
        setData(result.products);
        setTotalProducts(result.total_products);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, pageLimit, search, categories]);

  return (
    <ProductTable
      data={data}
      totalItems={totalProducts}
      columns={columns}
    />
  );
}

