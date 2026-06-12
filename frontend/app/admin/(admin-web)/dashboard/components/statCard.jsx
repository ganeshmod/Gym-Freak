import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

const StatCard = ({ title, percentageIncrease, amount }) => {
  const isPositive = percentageIncrease && percentageIncrease?.includes("+");
  return (
    <Card
      className={`relative overflow-hidden rounded-xl border shadow-sm1 gap-0 py-4`}
    >
      <CardHeader className="flex flex-row justify-between my-1 items-center">
        <CardTitle className="flex items-center font-normal text-sm text-gray-500">
          {title}
        </CardTitle>

        <p
          className={cn(
            "text-xs mb-0 py-1 px-1.5 border border-gray-400 rounded-md",
            isPositive ? "text-green-500" : "text-red-500"
          )}
        >
          {percentageIncrease}
        </p>
      </CardHeader>
      <CardContent>
        {amount && <div className="text-2xl font-bold">{amount}</div>}
      </CardContent>
    </Card>
  );
};

export default StatCard;
