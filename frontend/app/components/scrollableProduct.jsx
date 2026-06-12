"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { genericGetApi } from "@/app/admin/api-helper-admin";
import ProductCard from "./productCard";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const ScrollableProduct = () => {
    const [products, setProducts] = useState([]);
    const containerRef = useRef(null);
    const gymtxt = useRef(null)
    const gymText = gymtxt.current;
    const scrollContainerRef = useRef(null);

    useEffect(() => {
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

        fetchAllProducts();
    }, []);


    const demoBoxes = [
        { id: 1, color: "bg-gradient-to-br from-blue-500 to-cyan-500", title: "Box 1" },
        { id: 2, color: "bg-gradient-to-br from-purple-500 to-pink-500", title: "Box 2" },
        { id: 3, color: "bg-gradient-to-br from-orange-500 to-red-500", title: "Box 3" },
        { id: 4, color: "bg-gradient-to-br from-green-500 to-emerald-500", title: "Box 4" },
        { id: 5, color: "bg-gradient-to-br from-indigo-500 to-blue-500", title: "Box 5" },
        { id: 6, color: "bg-gradient-to-br from-pink-500 to-rose-500", title: "Box 6" },
        { id: 7, color: "bg-gradient-to-br from-yellow-500 to-orange-500", title: "Box 7" },
        { id: 8, color: "bg-gradient-to-br from-teal-500 to-cyan-500", title: "Box 8" },
    ];

    useEffect(() => {
        if (!products?.products || products.products.length === 0) return;

        const container = containerRef.current;
        const scrollContainer = scrollContainerRef.current;

        if (!container || !scrollContainer) return;

        // Wait for next frame to ensure DOM is ready
        requestAnimationFrame(() => {
            // Calculate scroll distance
            const scrollWidth = scrollContainer.scrollWidth;
            const containerWidth = container.offsetWidth;
            const scrollDistance = scrollWidth - containerWidth + 100;

            // Create the horizontal scroll animation
            const tween = gsap.to(scrollContainer, {
                x: -scrollDistance,
                ease: "none",
                scrollTrigger: {
                    trigger: container,
                    start: "top top",
                    end: () => `+=${scrollDistance * 2}`,
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    // markers: true, // Set to true for debugging
                },
            });

            // Set initial state for GYM MODE text
            gsap.set(gymText, {
                y: -1500,
                opacity: 0,
                scale: -1,
            });

            // Animate GYM MODE text to appear when it comes into view
            gsap.to(gymText, {
                y: 0,
                opacity: 1,
                scale: 1,
                ease: "power3.out",
                duration: 1.2,
                delay: 10,
                scrollTrigger: {
                    trigger: container,
                    start: "top top",
                    end: () => `+=${scrollDistance * 0.4}`, // Appears at 40% of scroll
                    scrub: 1,
                    // markers: false,
                },
            });

            // Cleanup
            return () => {
                tween.kill();
                ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
            };
        });
    }, [products]);

    return (
        <div className="w-full overflow-hidden bg-[#0e100f]">

            {/* Scroll Container */}
            <div ref={containerRef} className=" relative h-screen">
                <div
                    ref={scrollContainerRef}
                    className="flex gap-8 px-8 items-center h-full "
                >
                    <div className="bg-whsite flex-shrink-0 w-[5222px] h-[50%] flex px-32 ">
                        <div className="relative w-1/5 ">
                            <div className="relative max-w-xl">
                                <div className="absolute top-0 left-0 z-30 rounded-sm bg-[#fec5fb] px-6 py-3 md:px-10 md:py-5">
                                    <p className="whitespace-nowrap text-4xl font-extrabold text-black md:text-5xl">
                                        FUEL YOUR GRIND
                                    </p>
                                </div>
                                <div className="absolute top-3 z-10 left-3 rounded-sm bg-[#ffffff44] px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4">
                                    <p className="whitespace-nowrap text-2xl w-[29rem] h-[3.8rem] font-bold text-black sm:text-4xl md:text-4xl">

                                    </p>
                                </div>
                                <div className="relative z-0 top-20 left-10 inline-block rounded-sm bg-[#ff8709] py-3 md:px-10 md:py-5">
                                    <p className="whitespace-nowrap text-4xl font-extrabold text-white md:text-5xl">
                                        Next-Level Gear & Supps
                                    </p>
                                </div>
                            </div>
                            <div className="absolute bottom-0 max-w-4xl">
                                <p className="text-[#fffddd] text-3xl font-semibold">We exist where dedication meets design. We don't just sell gym wear and gear; we provide the catalyst for your commitment. Performance is not a goal; it's our only metric.</p>
                            </div>
                        </div>
                        <div className="w-1/5 flex items-center justify-center">
                            {/* <div className="relative max-w-xl">
                                <div className="absolute top-0 left-0 z-30 rounded-sm bg-[#fec5fb] px-6 py-3 md:px-10 md:py-5">
                                    <p className="whitespace-nowrap text-4xl font-extrabold text-black md:text-6xl">
                                        FUEL YOUR GRIND
                                    </p>
                                </div>
                                <div className="absolute top-3 z-10 left-3 rounded-sm bg-[#ffffff44] px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4">
                                    <p className="whitespace-nowrap text-2xl w-[35rem] h-[4.2rem] font-bold text-black sm:text-4xl md:text-4xl">
        
                                    </p>
                                </div>  
                                <div className="relative z-0 top-20 left-10 inline-block rounded-sm bg-red-600 py-3 md:px-10 md:py-5">
                                    <p className="whitespace-nowrap text-4xl font-extrabold text-white md:text-6xl">
                                        Next-Level Gear & Supps
                                    </p>
                                </div>
                            </div> */}

                        </div>
                        <div className="w-1/5 ">
                            <div className="relative z-0 inline-block rounded-sm md:px-10 md:py-2 bg-[#0ae448]" >

                            </div>
                            <div className="relative max-w-2xl  ">
                                <div className="flex  -top-96 ">
                                    <div className="relative z-0 inline-block rounded-sm md:px-10 md:py-2 bg-[#0ae448]" ref={gymtxt} >
                                        <p className="whitespace-nowrap text-4xl font-extrabold text-[#0e100f] md:text-6xl">
                                            GYM MODE
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScrollableProduct;