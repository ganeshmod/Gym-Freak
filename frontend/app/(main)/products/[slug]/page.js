"use client";

import React, { useCallback, useEffect, useState } from "react";
import LeftImagesPanel from "../../components/leftImagesPanel";
import ProductDetailRightPanel from "../../components/productDetailRightPanel";
import { genericGetApi } from "@/app/admin/api-helper-admin";
import { useParams } from "next/navigation";
import NewArrivals from "@/app/components/newArrivals";
import ProductSlider from "@/app/components/productSlider";
import ProductReviews from "../../components/productReviews";
import ProductShimmer, {
  ProductDetailShimmer,
} from "@/app/components/productShimmer";
import BuyNow from "@/components/buyNow";

const page = () => {
  const params = useParams();
  const slug = params.slug;
  const [product, setProduct] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState({
    productDetails: true,
    relatedProducts: true,
  });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading((prev) => ({ ...prev, relatedProducts: true }));
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
        setLoading((prev) => ({ ...prev, relatedProducts: false }));
      }
    };

    fetchAllProducts();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading((prev) => ({ ...prev, productDetails: true }));
      try {
        const res = await genericGetApi("/api/product/getProduct", { slug });
        if (res?.success) {
          const p = Array.isArray(res.data) ? res.data[0] : res.data;
          setProduct(p || null);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.log("Error fetching product", error);
      } finally {
        setLoading((prev) => ({ ...prev, productDetails: false }));
      }
    };
    fetchProduct();
  }, [slug]);

  const variants = product?.variants || [];
  const selectedVariant = variants?.[selectedIndex];
  const images = selectedVariant?.images?.map((im) => im.url) || [];

  if (loading?.productDetails) {
    return (
      <div className="p-10 app-bg">
        <ProductDetailShimmer />
        <ProductShimmer count={4} className="px-10" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 app-bg">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 m-0 lg:m-10 w-full mx-auto">
        <div className="w-full lg:w-2/3">
          <LeftImagesPanel images={images} />
        </div>
        <div className="w-full lg:w-1/3">
          <ProductDetailRightPanel
            product={product}
            variants={variants}
            selectedIndex={selectedIndex}
            onSelectVariant={setSelectedIndex}
          />
        </div>
        <BuyNow />
      </div>
      <div className="mt-10">
        <ProductSlider
          heading="Related Products"
          products={products?.products}
          loading={loading?.relatedProducts}
        />
      </div>
      <div className="mt-10">
        <ProductReviews
          productId={product?._id}
          userId="68f79d4fb3fc20a2dbaa0c63"
        />
      </div>
    </div>
  );
};

export default page;
