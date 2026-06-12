"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FaTruck,
  FaSyncAlt,
  FaHeadset,
  FaSmile,
} from "react-icons/fa";

export default function UpperFooter() {
  const infoItems = [
    {
      icon: <FaTruck size={26} />,
      title: "FREE DELIVERY ANYWHERE IN INDIA",
      description: (
        <>
          Dispatched in 48 hours,
          <br />
          delivered in just 3–5 working days*
        </>
      ),
    },
    {
      icon: <FaSyncAlt size={26} />,
      title: "EASY EXCHANGES",
      description: (
        <>72-hour window for quick size or product exchanges.</>
      ),
    },
    {
      icon: <FaHeadset size={26} />,
      title: "ROBUST CUSTOMER SUPPORT",
      description: (
        <>
          Reach us anytime: support@genrage.com
          <br />
          WhatsApp +91 9699798971
        </>
      ),
    },
    {
      icon: <FaSmile size={26} />,
      title: "200,000+ HAPPY CUSTOMERS",
      description: (
        <>More than numbers – a family of happy customers.</>
      ),
    },
  ];

  return (
    <section className="app-bg py-12 px-6">
      <div className="max-w-[1700px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {infoItems.map((item, idx) => (
          <Card
            key={idx}
            className="shadow-none border-none bg-transparent transition-transform"
          >
            <CardContent className="flex flex-col items-center justify-center gap-3 ">
              <div className="font-instrument text-[#1c1c1c]">{item.icon}</div>
              <h3 className="text-xs tracking-widest uppercase font-instrument text-[#444444]">
                {item.title}
              </h3>
              <p className="text-sm font-nunito tracking-wide leading-relaxed text-[#444444]">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
