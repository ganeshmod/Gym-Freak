"use client";

import React from "react";

const CategoryTabs = ({ tabs, activeTab, onSelect }) => {
  return (
    <div className="relative w-full my-10">
      <div
        className="
          flex lg:gap-6 sm:gap-4 md:gap-6 gap-3
          border-gray-300 
          overflow-x-auto 
          hide-scrollbar
          px-4 sm:px-0 
          justify-start sm:justify-center
        "
      >
        {tabs?.map((tab) => (
          <button
            key={`${tab.type}-${tab._id}`}
            onClick={() => onSelect(tab)}
            className={`
              relative shrink-0 
              text-[16px] sm:text-[16px] md:text-[16px] lg:text-[20px] 
              font-instrument uppercase 
            lg:tracking-[3px] sm:tracking-[2px]
              ${
                activeTab?._id === tab._id
                  ? "font-medium after:w-full"
                  : "text-gray-600 font-light"
              }
              after:content-[''] after:block after:h-[2px] 
              after:bg-black after:mt-1 after:mx-auto after:w-0 
              after:transition-all hover:cursor-pointer
              ${tab.type === "sub" ? "text-sm tracking-[2px]" : ""}
            `}
          >
            {tab.displayName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
