"use client";

import { useEffect, useState } from "react";
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
import { fetchAdminOverview } from "@/lib/api-admin-overview";

const chartConfig = {
  revenue: {
    label: "Revenue (IDR)",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type RevenueDay = {
  date: string;
  revenue: number;
};

export function RevenueLineGraph() {
  const [chartData, setChartData] = useState<RevenueDay[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchAdminOverview();
        const items = (res as any)?.revenue_by_day;
        if (Array.isArray(items) && items.length > 0) {
          const mapped: RevenueDay[] = items.map((item: any) => ({
            date: String(item.date),
            revenue: Number(item.revenue ?? 0),
          }));

          const hasPositive = mapped.some((item) => item.revenue > 0);

          if (hasPositive) {
            setChartData(mapped);
          }
        }
      } catch (error) {
        console.error("Failed to fetch daily revenue data", error);
      }
    };

    fetchData();
  }, []);

  const hasData = chartData.length > 0;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Daily Revenue</CardTitle>
        <CardDescription>
          Daily rental revenue from successful online payments.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {hasData ? (
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
        ) : (
          <div className="flex h-[250px] w-full items-center justify-center text-sm text-muted-foreground">
            Belum ada data pendapatan harian.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
