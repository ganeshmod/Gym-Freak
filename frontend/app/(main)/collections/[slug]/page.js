"use client";
import { genericGetApi } from "@/app/admin/api-helper-admin";
import ProductCard from "@/app/components/productCard";
import ProductShimmer from "@/app/components/productShimmer";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const SortSelect = ({ value, onChange }) => {
  const options = [
    { value: "popular", label: "Popular" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "newest", label: "Newest" },
  ];

  return (
    <select
      className="border rounded-md px-3 py-2 text-sm app-bg sm:w-auto"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
};

const FiltersSidebar = ({
  subcategories,
  activeSlug,
  minLimit,
  maxLimit,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  inStockOnly,
  setInStockOnly,
  onSelectCategory,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (activeSlug) setOpen(true);
  }, [activeSlug]);

  return (
    <aside className="w-full sm:w-64 shrink-0">
      <div className="space-y-4">
        <details
          className="border-b border-border/50 py-3"
          open={open}
          onToggle={(e) => setOpen(e.target.open)}
        >
          <summary className="flex cursor-pointer select-none items-center justify-between text-xs tracking-[0.25em] uppercase text-foreground/80">
            CATEGORY
            <span className="text-lg leading-none">▾</span>
          </summary>
          <div className="mt-3 space-y-2 ml-1">
            {subcategories.map((s) => {
              const isActive = s.slug == activeSlug;
              return (
                <button
                  key={s._id}
                  className={`block w-full text-left text-sm transition-colors ${
                    isActive
                      ? "font-semibold app-black-text"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                  onClick={() => {
                    onSelectCategory(s?.slug);
                    router.push(`/collections/${s.slug}`, {
                      scroll: false,
                      shallow: true,
                    });
                  }}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </details>

        <details open className="border-b border-border/50 py-3">
          <summary className="flex cursor-pointer select-none items-center justify-between text-xs tracking-[0.25em] uppercase text-foreground/80">
            PRICE
            <span className="text-lg leading-none">▾</span>
          </summary>

          <div className="mt-4 space-y-3">
            <div className="h-1 w-full rounded bg-muted">
              <div
                className="h-1 rounded bg-foreground"
                style={{
                  marginLeft: `${
                    ((priceMin - minLimit) / (maxLimit - minLimit)) * 100
                  }%`,
                  width: `${
                    ((priceMax - priceMin) / (maxLimit - minLimit)) * 100
                  }%`,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">₹</span>
                <Input
                  type="number"
                  value={priceMin}
                  min={minLimit}
                  max={priceMax}
                  onChange={(e) =>
                    setPriceMin(
                      Math.max(
                        minLimit,
                        Math.min(Number(e.target.value || 0), priceMax)
                      )
                    )
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">₹</span>
                <Input
                  type="number"
                  value={priceMax}
                  min={priceMin}
                  max={maxLimit}
                  onChange={(e) =>
                    setPriceMax(
                      Math.min(
                        maxLimit,
                        Math.max(Number(e.target.value || 0), priceMin)
                      )
                    )
                  }
                />
              </div>
            </div>
          </div>
        </details>

        <details open className="py-3">
          <summary className="flex cursor-pointer select-none items-center justify-between text-xs tracking-[0.25em] uppercase text-foreground/80">
            AVAILABILITY
            <span className="text-lg leading-none">▾</span>
          </summary>

          <div className="mt-4 flex items-center gap-3">
            <Switch
              id="instock"
              checked={inStockOnly}
              onCheckedChange={setInStockOnly}
            />
            <Label htmlFor="instock" className="text-sm cursor-pointer">
              In stock only
            </Label>
          </div>
        </details>

        <Separator className="mt-2" />
      </div>
    </aside>
  );
};

const page = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState({
    products: false,
  });
  const [subcategories, setSubcategories] = useState([]);
  const [productsData, setProductsData] = useState({ total: 0, products: [] });
  const [sort, setSort] = useState("popular");

  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(999999);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [activeSlug, setActiveSlug] = useState(slug);
  const VIRTUAL_SLUGS = ["new-arrivals", "best-sellers", "clearance", "all"];

  const selectedSub = useMemo(() => {
    return subcategories.find((s) => s?.slug == activeSlug) || null;
  }, [subcategories, activeSlug]);

  useEffect(() => {
    const loadSubs = async () => {
      try {
        const res = await genericGetApi("/api/product/subcategories");
        if (res?.success) setSubcategories(res.data || []);
        else setSubcategories([]);
      } catch {
        setSubcategories([]);
      }
    };
    loadSubs();
  }, []);

  useEffect(() => {
    setActiveSlug(slug);
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSlug]);

  useEffect(() => {
    const fetchProducts = async () => {
      // if (!selectedSub?._id) return;
      setLoading((prev) => ({ ...prev, products: true }));
      try {
        let resp;
        if (VIRTUAL_SLUGS.includes(activeSlug)) {
          resp = await genericGetApi("/api/product/getProduct", {
            page: 1,
            pageSize: 20,
          });
        } else if (selectedSub?._id) {
          resp = await genericGetApi("/api/product/getProduct", {
            subcategory: selectedSub._id,
            page: 1,
            pageSize: 20,
          });
        }

        if (!resp?.success || !resp?.data?.products) {
          setProductsData({ total: 0, products: [] });
          return;
        }

        setProductsData({
          total: resp?.data?.total ?? 0,
          products: resp?.data?.products ?? [],
        });
        if (resp?.success) {
          setProductsData({
            total: resp?.data?.total ?? 0,
            products: resp?.data?.products ?? [],
          });
        } else {
          setProductsData({ total: 0, products: [] });
        }
      } catch {
        setProductsData({ total: 0, products: [] });
      } finally {
        setLoading((prev) => ({ ...prev, products: false }));
      }
    };
    fetchProducts();
  }, [activeSlug, subcategories]);

  const priceOf = (p) => {
    const v = (p?.variants || []).reduce(
      (max, cur) =>
        (cur?.discountPercent || 0) > (max?.discountPercent || 0) ? cur : max,
      (p?.variants || [])[0] || { price: 0, discountPercent: 0 }
    );
    return v?.price ?? 0;
  };
  const isInStock = (p) => (p?.variants || []).some((v) => v?.inStock);

  const sortedProducts = useMemo(() => {
    const items = [...(productsData.products || [])];
    if (sort === "price-asc") {
      items.sort((a, b) => priceOf(a) - priceOf(b));
    } else if (sort === "price-desc") {
      items.sort((a, b) => priceOf(b) - priceOf(a));
    } else if (sort === "newest") {
      items.sort(
        (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
      );
    }
    return items;
  }, [productsData.products, sort]);

  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((p) => {
      const price = priceOf(p);
      if (price < priceMin || price > priceMax) return false;
      if (inStockOnly && !isInStock(p)) return false;
      return true;
    });
  }, [sortedProducts, priceMin, priceMax, inStockOnly]);

  const displayName = useMemo(() => {
    if (selectedSub?.name) return selectedSub.name;
    if (activeSlug === "new-arrivals") return "NEW ARRIVALS";
    if (activeSlug === "best-sellers") return "BEST SELLERS";
    if (activeSlug === "clearance") return "CLEARANCE";
    if (activeSlug === "all") return "ALL PRODUCTS";
    return activeSlug;
  }, [selectedSub, activeSlug]);

  return (
    <div className="app-bg px-3 sm:px-4 md:px-6 lg:px-10">
      <div className="sticky sm:top-12 md:top-16 lg:top-22 app-bg pt-4 mb-4 flex flex-col z-50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full flex items-center justify-center">
            <h1 className="text-2xl tracking-[0.2em] sm:text-xl md:text-2xl font-semibold uppercase">
              {displayName}
            </h1>
          </div>
          <SortSelect value={sort} onChange={setSort} />
        </div>
        <div className="mx-auto mt-4 w-full">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:gap-10">
        <div
          className="sm:sticky sm:top-24 sm:self-start sm:h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hidden mb-6 sm:mb-0 mx-5"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <FiltersSidebar
            subcategories={subcategories}
            activeSlug={activeSlug}
            minLimit={Math.min(priceMin, priceMax)}
            maxLimit={Math.max(priceMin, priceMax)}
            priceMin={priceMin}
            priceMax={priceMax}
            setPriceMin={setPriceMin}
            setPriceMax={setPriceMax}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            onSelectCategory={setActiveSlug}
          />
        </div>

        <div className="flex-1 relative z-0">
          {loading.products ? (
            <ProductShimmer count={12} className="px-0" />
          ) : filteredProducts?.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-foreground/60">
              No products found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
