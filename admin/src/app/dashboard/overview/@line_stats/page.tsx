import { delay } from '@/constants/mock-api';
import { RevenueLineGraph } from '@/features/overview/components/line-graph';

export default async function LineStats() {
  await delay(1000);
  return <RevenueLineGraph />;
}
