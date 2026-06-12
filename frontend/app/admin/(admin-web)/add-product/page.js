import React, { Suspense } from "react";
import AddProducts from "./AddProducts";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddProducts />
    </Suspense>
  );
}
