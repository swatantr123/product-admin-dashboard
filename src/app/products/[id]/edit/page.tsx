"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { getProduct, updateProduct } from "@/lib/api/products";
import { ProductForm } from "@/components/product-form";
import { getLocalProduct, saveLocalProduct } from "@/lib/products/mutations";
import type { Product, ProductMutationInput } from "@/lib/products/types";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return <AuthGuard><EditProduct params={params} /></AuthGuard>;
}

function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    params.then(({ id }) => {
      const numericId = Number(id);
      if (!Number.isInteger(numericId) || numericId < 1) {
        setError("Product not found.");
        return;
      }
      getProduct(numericId).then((result) => { if (active) setProduct(getLocalProduct(numericId) ?? result); }).catch(() => { if (active) setError("Product not found."); });
    });
    return () => { active = false; };
  }, [params]);

  async function handleSubmit(values: ProductMutationInput) {
    if (!product) return;
    const response = await updateProduct(product.id, values);
    saveLocalProduct({ ...product, ...response, ...values });
    router.replace(`/products/${product.id}`);
  }

  if (error) return <main className="state-page"><h1>{error}</h1><Link className="text-button" href="/products">Back to products</Link></main>;
  if (!product) return <main className="page-loading">Loading product...</main>;

  return <main className="form-page"><Link className="back-link" href={`/products/${product.id}`}>← Product details</Link><p className="eyebrow">Catalog / Edit</p><h1>Edit product</h1><ProductForm initialValues={{ title: product.title, description: product.description, category: product.category, price: product.price, stock: product.stock, thumbnail: product.thumbnail }} submitLabel="Save changes" onSubmit={handleSubmit} /></main>;
}