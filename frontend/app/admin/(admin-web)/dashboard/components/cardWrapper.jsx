import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import React from "react";

export const CardWrapper = ({
  title,
  filterPlaceholder,
  children,
  onButtonPress,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {onButtonPress && (
          <Button variant="outline" size="sm" onClick={onButtonPress}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {filterPlaceholder && (
          <Input placeholder={filterPlaceholder} className="mb-4 max-w-2/5" />
        )}
        {children}
      </CardContent>
    </Card>
  );
};
