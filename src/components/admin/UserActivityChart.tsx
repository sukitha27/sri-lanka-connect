import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface ActivityData {
  category: string;
  count: number;
}

interface UserActivityChartProps {
  data: ActivityData[];
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-3))",
  },
};

export const UserActivityChart = ({ data }: UserActivityChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity by Category</CardTitle>
        <CardDescription>Distribution of emergency types</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill={chartConfig.count.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
