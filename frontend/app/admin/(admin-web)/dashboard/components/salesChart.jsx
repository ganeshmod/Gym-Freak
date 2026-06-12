"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SalesChart({
  title,
  subtitle,
  value,
  badge,
  actionLabel,
  onActionClick,
  children,
  className = "",
}) {
  return (
    <Card className={cn("rounded-xl border", className)}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {subtitle && (
            <CardDescription className="text-sm">{subtitle}</CardDescription>
          )}
        </div>
        {actionLabel && (
          <Button variant="outline" size="sm" onClick={onActionClick}>
            {actionLabel}
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {(value || badge) && (
          <div className="flex items-center gap-2 mb-4">
            {value && <span className="text-2xl font-bold">{value}</span>}
            {badge && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  badge.color || "bg-green-100 text-green-700"
                )}
              >
                {badge.text}
              </span>
            )}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
