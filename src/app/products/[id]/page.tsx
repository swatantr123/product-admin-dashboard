"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { deleteProduct, getProduct } from "@/lib/api/products";
import { getLocalProduct, isLocalProductDeleted, markLocalProductDeleted } from "@/lib/products/mutations";
import type { Product } from "@/lib/products/types";

type ProductDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  return <AuthGuard><ProductDetails params={params} /></AuthGuard>;
}

function ProductDetails({ params }: ProductDetailsPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    params.then(({ id }) => {
      const numericId = Number(id);
      if (!Number.isInteger(numericId) || numericId < 1) {
        window.setTimeout(() => {
          setNotFound(true);
          setIsLoading(false);
        }, 0);
        return;
      }
      if (isLocalProductDeleted(numericId)) {
        window.setTimeout(() => {
          setNotFound(true);
          setIsLoading(false);
        }, 0);
        return;
      }

      getProduct(numericId, controller.signal).then((result) => {
        const localProduct = getLocalProduct(numericId);
        setProduct(localProduct ?? result);
      }).catch((requestError) => {
        if (!controller.signal.aborted) {
          setNotFound(requestError?.status === 404);
          setError(requestError instanceof Error ? requestError.message : "Could not load this product.");
        }
      }).finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    });

    return () => controller.abort();
  }, [params]);

  async function handleDelete() {
    if (!product || !window.confirm(`Delete ${product.title}?`)) return;
    try {
      await deleteProduct(product.id);
      markLocalProductDeleted(product.id);
      router.replace("/products");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete this product.");
    }
  }

  if (isLoading) return <main className="page-loading">Loading product...</main>;
  if (notFound) return <main className="state-page"><h1>Product not found</h1><p>This product ID does not exist.</p><Link className="text-button" href="/products">Back to products</Link></main>;
  if (!product) return <main className="state-page"><p className="form-error">{error || "Could not load this product."}</p><Link className="text-button" href="/products">Back to products</Link></main>;

  return (
    <main className="dashboard-page"><header className="dashboard-header"><div><Link className="back-link" href="/products">← Products</Link><h1>{product.title}</h1></div><div className="action-row"><Link className="secondary-button" href={`/products/${product.id}/edit`}>Edit</Link><button className="danger-button" onClick={handleDelete}>Delete</button></div></header>
      <section className="detail-layout"><div className="detail-gallery">{(product.images?.length ? product.images : [product.thumbnail]).map((image, index) => <div className="detail-image" key={image}><Image src={image} alt={`${product.title} image ${index + 1}`} width={560} height={560} priority={index === 0} /></div>)}</div><div className="detail-copy"><p className="eyebrow">{product.category} / Product {product.id}</p><h2>{product.title}</h2><p className="detail-description">{product.description}</p><div className="metric-grid"><div><span>Price</span><strong>${product.price.toFixed(2)}</strong></div><div><span>Rating</span><strong>{product.rating.toFixed(1)} / 5</strong></div><div><span>Stock</span><strong>{product.stock}</strong></div></div>{product.reviews?.length ? <div className="reviews"><h3>Recent reviews</h3>{product.reviews.map((review) => <article key={`${review.reviewerEmail}-${review.date}`}><strong>{review.reviewerName}</strong><span>{review.rating} / 5</span><p>{review.comment}</p></article>)}</div> : null}{error ? <p className="form-error">{error}</p> : null}</div></section>
    </main>
  );
}
