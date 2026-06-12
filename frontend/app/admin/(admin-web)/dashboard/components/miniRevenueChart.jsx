"use client";

import { LineChart, Line, XAxis, Tooltip as RechartsTooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const data = [
  { time: "Mon", value: 120 },
  { time: "Tue", value: 140 },
  { time: "Wed", value: 130 },
  { time: "Thu", value: 150 },
  { time: "Fri", value: 170 },
  { time: "Sat", value: 160 },
  { time: "Sun", value: 180 },
];

const CustomCursor = (props) => {
  const { points, width } = props;
  const { x, y } = points[0];
  return (
    <line
      x1={x}
      y1={y + 20} // start lower
      x2={x}
      y2={y - 20} // end higher
      stroke="orange"
      strokeWidth={2}
    />
  );
};

export default function MiniRevenueChart() {
  return (
    <ChartContainer className="h-[70px] w-full" config={{}}>
      <LineChart data={data}>
        <XAxis dataKey="time" hide />
        <RechartsTooltip
          content={<ChartTooltipContent className="!p-2" />}
          cursor={<CustomCursor />}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--chart-1)" 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
