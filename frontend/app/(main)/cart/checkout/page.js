import React, { Suspense } from "react";
import ProductCheckout from "./productCheckout";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductCheckout />
    </Suspense>
  );
}
