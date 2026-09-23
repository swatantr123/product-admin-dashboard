"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { createProduct } from "@/lib/api/products";
import { ProductForm } from "@/components/product-form";
import { createLocalProduct } from "@/lib/products/mutations";
import type { ProductMutationInput } from "@/lib/products/types";

export default function NewProductPage() {
  return <AuthGuard><NewProduct /></AuthGuard>;
}

function NewProduct() {
  const router = useRouter();

  async function handleSubmit(values: ProductMutationInput) {
    const response = await createProduct(values);
    const product = createLocalProduct(response, values);
    router.replace(`/products/${product.id}`);
  }

  return <main className="form-page"><Link className="back-link" href="/products">← Products</Link><p className="eyebrow">Catalog / New</p><h1>Add product</h1><ProductForm submitLabel="Create product" onSubmit={handleSubmit} /></main>;
}
