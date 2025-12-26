import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatisticsCard from '@/components/shadcn-studio/blocks/statistics-card-01';
import { CalendarClockIcon, ClockIcon, CarFrontIcon, CheckCircle2Icon } from 'lucide-react';

export const metadata = {
  title: 'Dashboard : Manage Bookings'
};

const bookingStatisticsCardData = [
  {
    icon: <CarFrontIcon className='size-4' />,
    value: '128',
    title: 'Total Bookings',
    changePercentage: '+5.0% vs last month'
  },
  {
    icon: <ClockIcon className='size-4' />,
    value: '24',
    title: 'Pending',
    changePercentage: '+1.2% vs last week'
  },
  {
    icon: <CheckCircle2Icon className='size-4' />,
    value: '64',
    title: 'Confirmed',
    changePercentage: '+3.4% vs last week'
  },
  {
    icon: <CalendarClockIcon className='size-4' />,
    value: '8',
    title: 'Cancelled',
    changePercentage: '-0.5% vs last week'
  },
  {
    icon: <CalendarClockIcon className='size-4' />,
    value: '32',
    title: 'Completed',
    changePercentage: '+2.1% vs last week'
  }
];

export default function Page() {
  return (
    <PageContainer
      scrollable
      pageTitle='Manage Bookings'
      pageDescription='Manage car rental bookings (placeholder table, connect to Laravel API later).'
    >
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 mb-4'>
        {bookingStatisticsCardData.map((card, index) => (
          <StatisticsCard
            key={index}
            icon={card.icon}
            value={card.value}
            title={card.title}
            changePercentage={card.changePercentage}
          />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bookings Table (Template)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            Here you can later add a DataTable for bookings with columns like
            customer, car, dates, total price, payment status, and booking
            status.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
