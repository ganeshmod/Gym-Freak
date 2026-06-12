"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { DashboardCard } from "./components/dashboardCard";
import MiniRevenueChart from "./components/miniRevenueChart";
import { SalesChart } from "./components/salesChart";
// import { Bar, BarChart, Tooltip, XAxis } from "recharts";
import { BarChart, Bar, XAxis, Tooltip, Line, LineChart } from "recharts";
import RecentOrders from "./components/recentOrders";
import BestSellingProducts from "./components/bestSellingProducts";

export default function AdminDashboard() {
  const barData = [
    { name: "January", desktop: 120, mobile: 130 },
    { name: "February", desktop: 150, mobile: 160 },
    { name: "March", desktop: 140, mobile: 150 },
    { name: "April", desktop: 110, mobile: 115 },
    { name: "May", desktop: 170, mobile: 180 },
    { name: "June", desktop: 160, mobile: 165 },
  ];

  const lineData = [
    { name: "February", value1: 100, value2: 90 },
    { name: "March", value1: 120, value2: 100 },
    { name: "April", value1: 160, value2: 130 },
    { name: "May", value1: 150, value2: 120 },
    { name: "June", value1: 180, value2: 140 },
    { name: "July", value1: 140, value2: 130 },
    { name: "August", value1: 170, value2: 150 },
    { name: "September", value1: 160, value2: 140 },
    { name: "October", value1: 175, value2: 160 },
    { name: "December", value1: 200, value2: 180 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Congratulations Toby! 🎉"
          subtitle="Month's Best Seller"
          amount="$15,231.89"
          percentageChange="+65% from last month"
          buttonLabel="View Sales"
          buttonHref="/sales"
          className=""
        />
        <DashboardCard
          title="Revenue"
          amount="$15,231.89"
          percentageChange="+65% from last month"
          className=""
          illustration={true}
        >
          <MiniRevenueChart />
        </DashboardCard>
        <DashboardCard
          title="Sales"
          amount="20K"
          percentageChange="-1.7% from last month"
          className=""
          illustration={true}
        >
          <MiniRevenueChart />
        </DashboardCard>
        <DashboardCard
          title="New Customers"
          amount="3000"
          percentageChange="+30% from last month"
          className=""
          illustration={true}
        >
          <MiniRevenueChart />
        </DashboardCard>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SalesChart title="Total Revenue" subtitle="Income in the last 28 days">
          <BarChart width={400} height={200} data={barData}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Bar dataKey="desktop" fill="#000" radius={[4, 4, 0, 0]} />
            <Bar dataKey="mobile" fill="#555" radius={[4, 4, 0, 0]} />
          </BarChart>
        </SalesChart>
        <SalesChart
          title="Returning Rate"
          value="$42,379"
          badge={{ text: "+2.5%", color: "bg-green-100 text-green-700" }}
          actionLabel="Export"
          onActionClick={() => alert("Export Clicked")}
        >
          <LineChart width={400} height={200} data={lineData}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value1"
              stroke="#000"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="value2"
              stroke="#ccc"
              strokeWidth={2}
            />
          </LineChart>
        </SalesChart>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <RecentOrders />
        <BestSellingProducts />
      </div>
    </div>
  );
}
