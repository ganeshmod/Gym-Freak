"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function SelectCategoryDropdown({
  name = "category",
  value = "",
  className = "",
  onChange = () => { },
  categories = [],
  loading = false,
  placeholder = "Choose a category",
}) {
  const [val, setVal] = useState(-1)

  useEffect(() => {
    setVal(value)
  }, [value])

  return (
    <div className="w-full ">
      <select
        id={name}
        name={name}
        value={val}
        onChange={(e) => {
          setVal(e.target.value)
          onChange(e.target.value)
        }}
        disabled={loading}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
      >
        <option value="-1" disabled>
          {loading ? "Loading..." : placeholder}
        </option>

        {categories.map((category, idx) => (
          <option key={idx} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}

