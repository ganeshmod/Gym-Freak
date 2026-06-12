"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronUp,
  ChevronDown,
  Star,
  MoreHorizontal,
  Filter,
  ChevronDownIcon,
  ChevronRight,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import React, { useEffect, useState } from "react";
import { genericGetApi } from "@/app/admin/api-helper-admin";
import 'react-photo-view/dist/react-photo-view.css';
import { PhotoProvider, PhotoView } from 'react-photo-view';

const ProductTable = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const router = useRouter()

  const fetchAllProducts = async () => {
    try {
      const response = await genericGetApi("/api/product/getProduct", {
        page: 1,
        pageSize: 20,
      });
      if (response && response?.success === true) {
        setProducts(response?.data);
      }
    } catch (error) {
      console.log("Error fetching all products", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const fetchProductCategories = async () => {
      try {
        const response = await genericGetApi("/api/product/getCategories");
        if (response?.success) {
          setCategoriesData(response.data);
        }
      } catch (error) {
        console.log("Error fetching product categories", error);
      }
    };
    fetchProductCategories();
  }, []);

  const filtered = products?.products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-2 px-2">
        <div className="flex gap-4">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[200px]"
          />
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Status</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Active</DropdownMenuItem>
                <DropdownMenuItem>Closed For Sale</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Category</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categoriesData?.map((category) => (
                  <DropdownMenuItem key={category?.id || category?.name}>
                    {category?.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Price: $100-$200</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>$0 - $50</DropdownMenuItem>
                <DropdownMenuItem>$50 - $100</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Toggle Product Name</DropdownMenuItem>
              <DropdownMenuItem>Toggle Price</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="border rounded-md px-2 min-w-[800px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>

              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.map((product) => {
              const isExpanded = expandedRow === product.id;
              return (
                <React.Fragment key={product.id}>
                  <TableRow key={product.id}>
                    {/* <TableCell>
                  <input type="checkbox" />
                </TableCell> */}
                    <TableCell>
                      <button
                        onClick={() =>
                          setExpandedRow(isExpanded ? null : product.id)
                        }
                      >
                        {isExpanded ? (
                          <ChevronDownIcon size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium flex items-center gap-2">
                      {product.variants[0]?.images?.[0]?.url ? (
                        <img
                          src={product.variants[0].images[0].url}
                          alt={product.name}
                          className="w-16 h-16 rounded object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded" />
                      )}
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category?.name}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          product.status === "Active"
                            ? "bg-green-100 text-green-700 border-green-400"
                            : "bg-red-100 text-red-700 border-red-400"
                        }
                      >
                        {product.status?.charAt(0).toUpperCase() +
                          product.status?.slice(1)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/add-product?pId=${product._id}`)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {/* handle view details */ }}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {/* handle delete */ }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-gray-50">
                        <div className="flex justify-end bg-white  rounded shadow-lg">
                          <div className="bg-white p-4 min-w-[700px] max-w-[1600px]">
                            {/* scroll wrapper */}
                            <div className="overflow-x-auto">
                              <Table className="w-full border-collapse">
                                <TableHeader>
                                  <TableRow className="font-bold">
                                    {[
                                      "image",
                                      "price",
                                      ...Array.from(
                                        new Set(
                                          product.variants.flatMap((variant) =>
                                            Object.keys(variant)
                                          )
                                        )
                                      ).filter(
                                        (key) =>
                                          key !== "_id" &&
                                          key !== "images" &&
                                          key !== "price"
                                      ),
                                    ].map((key) => (
                                      <TableHead key={key} className=" px-4 py-2">
                                        {key === "sku"
                                          ? "SKU"
                                          : key.charAt(0).toUpperCase() + key.slice(1)}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>

                                <TableBody>
                                  {product.variants.map((variant) => (
                                    <TableRow
                                      key={variant._id}
                                    >
                                      {[
                                        "images",
                                        "price",
                                        ...Array.from(
                                          new Set(
                                            product.variants.flatMap((v) => Object.keys(v))
                                          )
                                        ).filter(
                                          (key) =>
                                            key !== "_id" &&
                                            key !== "images" &&
                                            key !== "price"
                                        ),
                                      ].map((key) => (
                                        <TableCell key={key} className="text-center  px-3 py-2">
                                          {key === "images" && Array.isArray(variant[key]) && variant[key].length > 0 ? (
                                            <PhotoProvider>
                                              <div className="flex gap-2 justify-start w-auto overflow-x-auto">
                                                {variant[key].map((img, index) => (
                                                  <PhotoView key={index} src={img.url}>
                                                    <img
                                                      src={img.url}
                                                      alt={`${product.name} ${variant.flavor || ""} image ${index + 1}`}
                                                      className="w-16 h-16 object-contain rounded cursor-pointer flex-shrink-0"
                                                    />
                                                  </PhotoView>
                                                ))}
                                              </div>
                                            </PhotoProvider>
                                          ) : key === "price" ? (
                                            `${(variant[key] / 100).toFixed(2)}`
                                          ) : (
                                            variant[key]?.toString().trim() || "-"
                                          )}
                                        </TableCell>

                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>


      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ProductTable;
