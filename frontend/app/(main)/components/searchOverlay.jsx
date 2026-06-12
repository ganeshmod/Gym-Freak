"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Search } from "lucide-react";
import { genericGetApi } from "@/app/admin/api-helper-admin";
import ProductCard from "@/app/components/productCard";

const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState("PRODUCTS");
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        const scrollY = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || "0") * -1);
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchProducts = async (query) => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const response = await genericGetApi("/api/product/getProduct", {
        search: query,
        page: 1,
        pageSize: 12,
        // status: "active",
      });

      if (response?.success && response?.data?.products) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async (query) => {
    if (!query.trim()) {
      setCollections([]);
      return;
    }

    try {
      const response = await genericGetApi("/api/product/subcategories");
      if (response?.success && response?.data) {
        const filtered = response.data.filter((col) =>
          col.name?.toLowerCase().includes(query.toLowerCase())
        );
        setCollections(filtered.slice(0, 4));
      } else {
        setCollections([]);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      setCollections([]);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (activeTab === "PRODUCTS") {
      fetchProducts(debouncedQuery);
    } else if (activeTab === "COLLECTIONS") {
      fetchCollections(debouncedQuery);
    }
  }, [debouncedQuery, activeTab, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setProducts([]);
      setCollections([]);
      setActiveTab("PRODUCTS");
    }
  }, [isOpen]);

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setActiveTab("PRODUCTS");
  };

  const handleViewAll = () => {
    onClose();
    router.push(`/collections/all`);
  };

  const handleCollectionClick = (collection) => {
    onClose();
    router.push(`/collections/${collection.slug || collection._id}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 top-[60px] md:top-[80px] bg-black/90 backdrop-blur-sm z-40 overflow-y-auto">
      <div className="w-full mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center gap-4 mb-6 border-b border-white/20 pb-4">
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-5 h-5 text-white" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or collections..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
            />
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-6 mb-6 border-b border-white/10">
          {["PRODUCTS", "COLLECTIONS"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-white border-b-2 border-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeTab === "PRODUCTS" && (
            <div className="md:col-span-3">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      themeColor="white"
                      onClick={onClose}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  {searchQuery.trim()
                    ? "No products found"
                    : "Start typing to search products"}
                </div>
              )}
            </div>
          )}

          {activeTab === "COLLECTIONS" && (
            <div className="md:col-span-3">
              {collections.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {collections.map((collection) => (
                    <div
                      key={collection._id}
                      onClick={() => handleCollectionClick(collection)}
                      className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <h3 className="text-white font-medium mb-2">
                        {collection.name}
                      </h3>
                      {collection.coverUrl && (
                        <Image
                          src={collection.coverUrl}
                          alt={collection.name}
                          width={200}
                          height={200}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  {searchQuery.trim()
                    ? "No collections found"
                    : "Start typing to search collections"}
                </div>
              )}
            </div>
          )}
        </div>

        {searchQuery.trim() &&
          activeTab === "PRODUCTS" &&
          products.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleViewAll}
                className="px-6 py-2 border border-gray-400 text-gray-400 hover:text-white hover:border-white transition-colors rounded"
              >
                VIEW ALL RESULTS
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default SearchOverlay;
