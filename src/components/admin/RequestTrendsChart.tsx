import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface TrendData {
  date: string;
  requests: number;
  verified: number;
}

interface RequestTrendsChartProps {
  data: TrendData[];
}

const chartConfig = {
  requests: {
    label: "Total Requests",
    color: "hsl(var(--chart-1))",
  },
  verified: {
    label: "Verified",
    color: "hsl(var(--chart-2))",
  },
};

export const RequestTrendsChart = ({ data }: RequestTrendsChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Trends</CardTitle>
        <CardDescription>Daily request and verification activity</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="requests"
              stackId="1"
              stroke={chartConfig.requests.color}
              fill={chartConfig.requests.color}
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="verified"
              stackId="2"
              stroke={chartConfig.verified.color}
              fill={chartConfig.verified.color}
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
