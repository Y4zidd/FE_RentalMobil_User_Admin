'use client';

import { useEffect, useState } from 'react';
import { IconTrendingUp } from '@tabler/icons-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { fetchAdminOverview } from '@/lib/api-admin-overview';

const chartConfig = {
  revenue: {
    label: 'Revenue'
  },
  online: {
    label: 'Online payments',
    color: 'var(--primary)'
  },
  pay_at_location: {
    label: 'Pay at location',
    color: 'var(--primary)'
  }
} satisfies ChartConfig;

type RevenueMonth = {
  month: string;
  online: number;
  pay_at_location: number;
};

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function formatMonthLabel(value: string) {
  const parts = value.split('-');
  if (parts.length !== 2) return value;
  const monthIndex = Number(parts[1]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return value;
  return monthNames[monthIndex];
}

export function AreaGraph() {
  const [chartData, setChartData] = useState<RevenueMonth[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const overview = await fetchAdminOverview();
        const items = overview.revenue_by_month;
        if (Array.isArray(items) && items.length > 0) {
          const mapped: RevenueMonth[] = items.map((item: any) => ({
            month: formatMonthLabel(String(item.month)),
            online: Number(item.online ?? 0),
            pay_at_location: Number(item.pay_at_location ?? 0)
          }));

          const hasPositive = mapped.some(
            (item) => item.online > 0 || item.pay_at_location > 0
          );

          if (hasPositive) {
            setChartData(mapped);
          }
        }
      } catch (error) {
        console.error('Failed to fetch monthly revenue data', error);
      }
    };

    fetchData();
  }, []);

  const hasData = chartData.length > 0;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Monthly Revenue Trend</CardTitle>
        <CardDescription>
          Rental revenue by month, split by payment method.
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[250px] w-full'
          >
            <AreaChart
              data={chartData}
              margin={{
                left: 12,
                right: 12
              }}
            >
              <defs>
                <linearGradient id='fillOnline' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-online)'
                    stopOpacity={1.0}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-online)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id='fillPayAtLocation' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-pay_at_location)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-pay_at_location)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='dot' />}
              />
              <Area
                dataKey='pay_at_location'
                type='natural'
                fill='url(#fillPayAtLocation)'
                stroke='var(--color-pay_at_location)'
                stackId='a'
              />
              <Area
                dataKey='online'
                type='natural'
                fill='url(#fillOnline)'
                stroke='var(--color-online)'
                stackId='a'
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className='flex h-[250px] w-full items-center justify-center text-sm text-muted-foreground'>
            There is no monthly income data yet.
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            {hasData ? (
              <>
                <div className='flex items-center gap-2 leading-none font-medium'>
                  <IconTrendingUp className='h-4 w-4' />
                  Tren pendapatan bulanan.
                </div>
                <div className='text-muted-foreground flex items-center gap-2 leading-none'>
                  Periode {chartData[0].month} -{' '}
                  {chartData[chartData.length - 1].month}
                </div>
              </>
            ) : (
              <div className='text-muted-foreground flex items-center gap-2 leading-none'>
                The graph will appear after a successful transaction.
              </div>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
