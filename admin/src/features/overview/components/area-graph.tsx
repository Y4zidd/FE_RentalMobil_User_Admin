'use client';

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

// TODO: Replace dummy data with real monthly revenue from
// GET /api/admin/overview (field: revenue_by_month from payments/Midtrans)
const chartData = [
  { month: 'January', online: 12000000, pay_at_location: 5000000 },
  { month: 'February', online: 15000000, pay_at_location: 6000000 },
  { month: 'March', online: 11000000, pay_at_location: 5500000 },
  { month: 'April', online: 8000000, pay_at_location: 4000000 },
  { month: 'May', online: 17000000, pay_at_location: 7000000 },
  { month: 'June', online: 19000000, pay_at_location: 7500000 }
];

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

export function AreaGraph() {
  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Monthly Revenue Trend</CardTitle>
        <CardDescription>
          Rental revenue by month, split by payment method.
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
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
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              Revenue up by 5.2% this month{' '}
              <IconTrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
