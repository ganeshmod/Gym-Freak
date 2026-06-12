"use client";

import { genericGetApi } from "@/app/admin/api-helper-admin";
import { Skeleton } from "@/app/components/productShimmer";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export const SectionHeader = ({ title, subtitle }) => {
  return (
    <div className="mx-auto mb-8 w-full max-w-6xl text-center">
      <h1 className="text-3xl tracking-[0.2em] md:text-4xl font-semibold fon">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
};

export const CollectionCard = ({
  cover,
  name,
  count = 0,
  href = "#",
  accent = "from-zinc-900/0 to-zinc-900/70",
}) => {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border bg-muted/10"
    >
      <div className="relative aspect-[4/5] w-full">
        {cover ? (
          <Image
            src={cover}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
        )}

        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-t",
            accent
          )}
        />

        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black text-white px-3 py-1 text-xs backdrop-blur">
          <Image src="/svg/cart.svg" width={18} height={18} alt="cart-icon" />
          {count} ITEM{count === 1 ? "" : "S"}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold tracking-wide uppercase">
                {name}
              </h3>
            </div>
            <div className="shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors group-hover:bg-background">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  className="text-foreground transition-transform group-hover:translate-x-0.5"
                >
                  <path
                    d="M5 12h14M13 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-inset ring-white/10 transition-all group-hover:ring-1" />
      </div>
    </Link>
  );
};

const page = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState({
    category: false,
  });

  useEffect(() => {
    const fetchSubCategories = async () => {
      setLoading((prev) => ({ ...prev, category: true }));
      try {
        const subcategoriesResponse = await genericGetApi(
          "/api/product/subcategories"
        );

        if (!subcategoriesResponse?.success) {
          setSubCategories([]);
          return;
        }

        const subs = subcategoriesResponse.data || [];

        const enriched = await Promise.all(
          subs.map(async (sub) => {
            const res = await genericGetApi("/api/product/getProduct", {
              subcategory: sub._id,
              page: 1,
              pageSize: 1,
            });

            const total = res?.data?.total ?? 0;
            const first = res?.data?.products?.[0] || null;
            const coverUrl = first?.variants?.[0]?.images?.[0]?.url || null;

            return {
              ...sub,
              count: total,
              coverUrl,
            };
          })
        );
        const filtered = enriched.filter((c) => (c.count ?? 0) > 0);
        setSubCategories(filtered);
      } catch (error) {
        console.log("Error fetching data", error);
        setSubCategories([]);
      } finally {
        setLoading((prev) => ({ ...prev, category: false }));
      }
    };

    fetchSubCategories();
  }, []);

  return (
    <div className="app-bg px-4 py-10 md:px-6 lg:px-10">
      <SectionHeader
        title="ALL COLLECTIONS"
        subtitle="Browse our complete range, grouped by categories"
      />
      {loading?.category ? (
        <div className="mx-auto grid w-full max-w-[80vw] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-[80vw] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subCategories?.map((c) => {
            const tone = (() => {
              const hash = (c.name || "")
                .split("")
                .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
              const tones = [
                "from-zinc-950/0 to-zinc-950/70",
                "from-neutral-950/0 to-neutral-950/70",
                "from-slate-950/0 to-slate-950/70",
                "from-gray-950/0 to-gray-950/70",
              ];
              return tones[hash % tones.length];
            })();

            return (
              <CollectionCard
                key={`${c._id}`}
                cover={c.coverUrl}
                name={c.name}
                count={c.count}
                accent={tone}
                href={`/collections/${c?.slug}`}
              />
            );
          })}
        </div>
      )}
      <div className="mx-auto mt-10 w-full">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
      </div>
    </div>
  );
};

export default page;
