'use client';
import { Bar, BarChart, Pie, PieChart, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

const barChartConfig: ChartConfig = {
  minutes: {
    label: 'Minutes',
    color: 'hsl(var(--secondary))',
  },
};

const pieChartConfig = {
  minutes: {
    label: 'Minutes',
  },
  Gaming: {
    label: 'Gaming',
    color: 'hsl(var(--chart-1))',
  },
  Creative: {
    label: 'Creative',
    color: 'hsl(var(--chart-2))',
  },
  Education: {
    label: 'Education',
    color: 'hsl(var(--chart-3))',
  },
  Music: {
    label: 'Music',
    color: 'hsl(var(--chart-4))',
  },
  Other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export function AnalyticsCharts({
  watchTimeData,
  categoryData,
}: {
  watchTimeData: any[];
  categoryData: any[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Watch Time</CardTitle>
          <CardDescription>Total minutes watched per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={watchTimeData}
              margin={{ top: 20 }}
            >
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Time spent on different topics</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ChartContainer
            config={pieChartConfig}
            className="mx-auto aspect-square h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={categoryData}
                dataKey="minutes"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                {categoryData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={entry.fill}
                    className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
