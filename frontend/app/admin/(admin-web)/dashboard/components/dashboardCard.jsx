"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardCard({
  title,
  subtitle,
  amount,
  percentageChange,
  description,
  buttonLabel,
  buttonHref,
  illustration = false,
  children,
  className = "",
}) {
  const isPositive = percentageChange && percentageChange?.includes("+");
  const router = useRouter();
  return (
    <Card
      className={`relative overflow-hidden rounded-xl border shadow-sm1 gap-4 py-3 ${className}`}
    >
      <CardHeader className="flex flex-row justify-items-center align-middle min-h-[48px]">
        <CardTitle className="flex items-center gap-2 leading-tight">
          {title}
        </CardTitle>
        {illustration
          ? percentageChange && (
              <p
                className={cn(
                  "text-xs mb-0",
                  isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {percentageChange}
              </p>
            )
          : subtitle && (
              <CardDescription className="text-xs ">{subtitle}</CardDescription>
            )}
      </CardHeader>

      <CardContent>
        {amount && <div className="text-2xl font-bold">{amount}</div>}
        {!illustration && percentageChange && (
          <p
            className={cn(
              "text-xs mb-4",
              isPositive ? "text-green-500" : "text-red-500"
            )}
          >
            {percentageChange}
          </p>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {illustration && <div className="mt-4 w-full">{children}</div>}

        {!illustration && buttonLabel && (
          <Button onClick={() => router.push(buttonHref || "#")}>
            {buttonLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
