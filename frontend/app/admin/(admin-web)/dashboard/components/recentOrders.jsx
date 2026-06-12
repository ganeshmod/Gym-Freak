import React from "react";
import { CardWrapper } from "./cardWrapper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

const RecentOrders = () => {
  const orders = [
    {
      id: "#9189",
      name: "Emma Wilson",
      product: "Spark Plug",
      amount: "$150.00",
      status: "Success",
      avatar: "/avatars/1.png",
    },
    {
      id: "#10211",
      name: "Noah Davis",
      product: "Transmission Fluid",
      amount: "$120.00",
      status: "Paid",
      avatar: "/avatars/2.png",
    },
    {
      id: "#11233",
      name: "Ava Johnson",
      product: "Battery Terminal",
      amount: "$85.00",
      status: "Processing",
      avatar: "/avatars/3.png",
    },
    {
      id: "#12255",
      name: "William Brown",
      product: "Alternator",
      amount: "$420.00",
      status: "Failed",
      avatar: "/avatars/4.png",
    },
    {
      id: "#13277",
      name: "Charlotte Miller",
      product: "Timing Belt",
      amount: "$380.00",
      status: "Success",
      avatar: "/avatars/5.png",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Success":
        return "bg-green-100 text-green-800";
      case "Paid":
        return "bg-orange-100 text-orange-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  return (
    <CardWrapper
      title="Recent Orders"
      filterPlaceholder="Filter orders ..."
      onButtonPress={() => console.log("Exporting orders")}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, idx) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>SS</AvatarFallback>
                </Avatar>
                {order.name}
              </TableCell>
              <TableCell>{order.product}</TableCell>
              <TableCell>{order.amount}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span>Showing 1 of {orders.length} entries</span>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </CardWrapper>
  );
};

export default RecentOrders;
