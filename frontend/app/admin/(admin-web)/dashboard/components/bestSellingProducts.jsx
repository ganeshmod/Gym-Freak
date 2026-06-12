import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { CardWrapper } from "./cardWrapper";

const BestSellingProducts = () => {
  const products = [
    {
      product: "Sports Shoes",
      sold: "$316.00",
      sales: 10,
      image: "/products/shoes.png",
    },
    {
      product: "Black T-Shirt",
      sold: "$274.00",
      sales: 20,
      image: "/products/tshirt.png",
    },
    {
      product: "Jeans",
      sold: "$195.00",
      sales: 15,
      image: "/products/jeans.png",
    },
    {
      product: "Red Sneakers",
      sold: "$402.00",
      sales: 40,
      image: "/products/sneakers.png",
    },
    {
      product: "Red Sneakers",
      sold: "$402.00",
      sales: 40,
      image: "/products/sneakers.png",
    },
  ];

  return (
    <CardWrapper
      title="Best Selling Products"
      filterPlaceholder="Filter products..."
      onButtonPress={() => console.log("Exporting products...")}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Sold</TableHead>
            <TableHead>Sales</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p, index) => (
            <TableRow key={index}>
              <TableCell className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>SS</AvatarFallback>
                </Avatar>
                {p.product}
              </TableCell>
              <TableCell>{p.sold}</TableCell>
              <TableCell>{p.sales}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span>Showing 1 of {products.length} entries</span>
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

export default BestSellingProducts;
