"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// TODO: Ganti data dummy ini dengan data asli dari endpoint
// GET /api/admin/overview (field: revenue_by_day dari tabel payments/Midtrans)
const chartData = [
  { date: "2025-01-01", revenue: 1200000 },
  { date: "2025-01-02", revenue: 900000 },
  { date: "2025-01-03", revenue: 1500000 },
  { date: "2025-01-04", revenue: 800000 },
  { date: "2025-01-05", revenue: 1750000 },
  { date: "2025-01-06", revenue: 1300000 },
  { date: "2025-01-07", revenue: 2100000 },
];

const chartConfig = {
  revenue: {
    label: "Revenue (IDR)",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function RevenueLineGraph() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Daily Revenue</CardTitle>
        <CardDescription>
          Daily rental revenue from successful online payments.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(5)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value / 1000000}jt`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
