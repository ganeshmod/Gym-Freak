"use client";
import { useRouter } from "next/navigation";
import CategoryProducts from "../components/categoryProducts";
import NewArrivals from "../components/newArrivals";
import Hero from "../components/hero";
import ScrollableProduct from "../components/scrollableProduct";
import Reviews from "./components/reviews";
import { genericGetApi } from "../admin/api-helper-admin";
import { useEffect, useState } from "react";
import FashionCategories from "../components/trending";
import { FashionCategoriesSkeleton } from "../components/productShimmer";
import Image from "next/image";

export default function Home() {
  const [reviewsData, setReviewsData] = useState({});
  const router = useRouter()

  const fetchAllReviews = async () => {
    try {
      const response = await genericGetApi("/api/review/allReviews");
      if (response && response?.success) {
        setReviewsData(response?.data);
      }
    } catch (error) {
      console.log("Error fetching reviews", error);
    }
  };


  useEffect(() => {
    fetchAllReviews();
  }, []);

  return (
    <div className="app-bg">
      <Hero />
      <div className="mt-20 app-bg">
        <CategoryProducts />
      </div>
      {/* <FashionCategories /> */}
      {/* <FashionCategoriesSkeleton/>   */}
      <div className="new-arrivals app-bg">
        <NewArrivals />
      </div>
      <div className="relative w-full h-[60vh] min-h-[350px] sm:h-[70vh] lg:h-[800px]">
        <Image
          src="/png/shopAll.png"
          alt="Shop All"
          fill
          className="object-cover"
          priority
        />

        <button
          onClick={() => router.push("/collections/all")}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white font-semibold md:text-xl sm:text-md cursor-pointer px-6 py-2 rounded-full  group"
        >
          <span className="relative inline-block">
            Shop All
            {/* underline */}
            <span className="underline absolute left-0 -bottom-1 w-full h-[2px] bg-white origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
          </span>
        </button>
      </div>


      <div>
        <Reviews reviews={reviewsData} />
      </div>

      {/* <div className="scroll-section mt-20">
                <ScrollableProduct />
            </div> */}

      {/* <div>
                <div className="h-96">loremfdfk dlfal;fka </div>
                <div className="h-96">loremfdfk dlfal;fka </div>
                <div className="h-96">loremfdfk dlfal;fka </div>
                <div className="h-96">loremfdfk dlfal;fka </div>
                <div className="h-96">loremfdfk dlfal;fka </div>
                <div className="h-96">loremfdfk dlfal;fka </div>
                <div>loremfdfk dlfal;fka </div>
            </div> */}
    </div>
  );
}
