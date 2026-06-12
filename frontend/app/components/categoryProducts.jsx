"use client";

import React, { useEffect, useState } from "react";
import CategoryTabs from "./categoryTabs";
import ProductSlider from "./productSlider";
import { genericGetApi } from "@/app/admin/api-helper-admin";
import ProductShimmer from "./productShimmer";

const CategoryProducts = () => {
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [displayTabs, setDisplayTabs] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const categoriesResponse = await genericGetApi(
          "/api/product/getCategories"
        );
        if (categoriesResponse?.success) {
          setAllCategories(categoriesResponse.data || []);
        }

        const subcategoriesResponse = await genericGetApi(
          "/api/product/subcategories"
        );
        if (subcategoriesResponse?.success) {
          setAllSubcategories(subcategoriesResponse.data || []);
        }
      } catch (error) {
        console.log("Error fetching data", error);
      }
    };
    
   
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!allCategories && !allSubcategories) return;

    const firstTwoCategories = (allCategories || []).slice(0, 2).map((cat) => ({
      ...cat,
      type: "main",
      displayName: cat?.name,
    }));

    const firstTwoSubcategories = (allSubcategories || [])
      .slice(0, 2)
      .map((sub) => ({
        ...sub,
        type: "sub",
        displayName: sub?.name,
      }));

    const tabs = [...firstTwoCategories, ...firstTwoSubcategories].slice(0, 4);
    setDisplayTabs(tabs);

    if (!activeTab) {
      setActiveTab(firstTwoCategories[0] || firstTwoSubcategories[0] || null);
    }
  }, [allCategories, allSubcategories]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!activeTab) return;

      setLoading(true);
      try {
        const params = { page: 1, pageSize: 20 };

        if (activeTab.type === "sub") {
          params.subcategory = activeTab._id;
        } else if (activeTab.type === "main") {
          params.category = activeTab._id;
        }

        const response = await genericGetApi("/api/product/getProduct", params);
        if (response?.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.log("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <section className="px-4 mb-4 bg-inherit">
      <CategoryTabs
        tabs={displayTabs}
        activeTab={activeTab}
        onSelect={handleTabClick}
      />

      {loading ? (
        <ProductShimmer count={4} className="px-10" />
      ) : (
        <ProductSlider products={products?.products || []} />
      )}
    </section>
  );
};

export default CategoryProducts;
