"use client";

import React, { useEffect, useRef, useState } from "react";
import { genericGetApi } from "../admin/api-helper-admin";
import ProductCard from "./productCard";
import gsap from "gsap";
import ProductShimmer from "./productShimmer";

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);
  return (
    <div className="items-center justify-center flex flex-col w-full mt-10">
      <div className="w-full items-center justify-center flex flex-col gap-4 mb-8   ">
        <div className="text-center">
          <p className="text-xs tracking-widest mb-2 app-bg">LATEST COLLECTION</p>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-2">
            NEW ARRIVALS
          </h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-12 bg-gray-500"></div>
            <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: '#c4c4c4' }}></div>
            <div className="h-px w-12 bg-gray-300"></div>
          </div>
        </div>
      </div>
      {loading ? (
        <ProductShimmer count={8} className="w-full px-20 mx-20" />
      ) : (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mx-20">
          {products?.products?.map((product, index) => (
            <div key={index}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewArrivals;
