"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { ProductList } from "@/components/product-list";
import { getProductCategories, getProducts, searchProducts, type ProductCategory } from "@/lib/api/products";
import { clearStoredSession } from "@/lib/auth/session";
import { applyLocalMutations } from "@/lib/products/mutations";
import type { Product, ProductSortField } from "@/lib/products/types";

const SORTS: ProductSortField[] = ["title", "price", "rating"];

function parsePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseLimit(value: string | null): 10 | 20 | 50 {
  if (value === "20") return 20;
  if (value === "50") return 50;
  return 10;
}

export default function ProductsPage() {
  return <AuthGuard><ProductsDashboard /></AuthGuard>;
}

function ProductsDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const limit = parseLimit(searchParams.get("limit"));
  const rawPage = searchParams.get("page");
  const rawLimit = searchParams.get("limit");
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const sortParam = searchParams.get("sort");
  const sort: ProductSortField = SORTS.includes(sortParam as ProductSortField) ? sortParam as ProductSortField : "title";
  const [searchInput, setSearchInput] = useState(search);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;
    if (rawPage !== null && String(page) !== rawPage) {
      params.set("page", String(page));
      changed = true;
    }
    if (rawLimit !== null && String(limit) !== rawLimit) {
      params.set("limit", String(limit));
      changed = true;
    }
    if (sortParam !== null && sort === "title" && sortParam !== "title" || sortParam !== null && !SORTS.includes(sortParam as ProductSortField)) {
      params.set("sort", sort);
      changed = true;
    }
    if (changed) router.replace(`${pathname}?${params.toString()}`);
  }, [limit, page, pathname, rawLimit, rawPage, router, searchParams, sort, sortParam]);

  function updateUrl(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput !== search) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchInput.trim()) {
          params.set("search", searchInput.trim());
        } else {
          params.delete("search");
        }
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [pathname, router, search, searchInput, searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    getProductCategories(controller.signal).then(setCategories).catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadingTimer = window.setTimeout(() => {
      setIsLoading(true);
      setError("");
    }, 0);
    const request = search
      ? searchProducts(search, { limit, skip: (page - 1) * limit, signal: controller.signal })
      : getProducts({ limit, skip: (page - 1) * limit, sort, order: "asc", signal: controller.signal });

    request.then((result) => {
      const mergedProducts = applyLocalMutations(result.products);
      const visible = category ? mergedProducts.filter((product) => product.category === category) : mergedProducts;
      setProducts(visible);
      setTotal(category && search ? visible.length : result.total);
    }).catch((requestError) => {
      if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : "Could not load products.");
    }).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false);
    });
    return () => {
      window.clearTimeout(loadingTimer);
      controller.abort();
    };
  }, [category, limit, page, search, sort]);

  const visibleProducts = useMemo(() => {
    if (sort === "title") return [...products].sort((left, right) => left.title.localeCompare(right.title));
    return [...products].sort((left, right) => right[sort] - left[sort]);
  }, [products, sort]);
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const firstResult = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastResult = Math.min(page * limit, total);

  useEffect(() => {
    if (total > 0 && page > pageCount) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(pageCount));
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [page, pageCount, pathname, router, searchParams, total]);

  function logout() {
    clearStoredSession();
    router.replace("/login");
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header"><div><span className="brand-mark">NORTHSTAR / OPS</span><h1>Product catalog</h1></div><div className="action-row"><Link className="primary-button" href="/products/new">Add product</Link><button className="text-button" onClick={logout}>Log out</button></div></header>
      <section className="dashboard-content" aria-labelledby="catalog-heading">
        <div className="section-heading"><div><p className="eyebrow">Operations / Catalog</p><h2 id="catalog-heading">Products</h2></div><span className="result-count">Showing {firstResult.toLocaleString()}–{lastResult.toLocaleString()} of {total.toLocaleString()} results</span></div>
        <div className="toolbar">
          <label className="search-field"><span className="sr-only">Search products</span><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search products" /></label>
          <select value={category} onChange={(event) => updateUrl({ category: event.target.value, page: "1" })} aria-label="Filter by category"><option value="">All categories</option>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select>
          <select value={sort} onChange={(event) => updateUrl({ sort: event.target.value, page: "1" })} aria-label="Sort products">{SORTS.map((value) => <option key={value} value={value}>Sort: {value}</option>)}</select>
          <select value={limit} onChange={(event) => updateUrl({ limit: event.target.value, page: "1" })} aria-label="Products per page"><option value="10">10 / page</option><option value="20">20 / page</option><option value="50">50 / page</option></select>
        </div>
        {error ? <div className="state-panel"><p className="form-error">{error}</p><button className="primary-button" onClick={() => router.refresh()}>Retry</button></div> : null}
        {!error && isLoading ? <div className="state-panel">Loading catalog...</div> : null}
        {!error && !isLoading && !visibleProducts.length ? <div className="state-panel"><h3>No products found</h3><p>Try a different search or category.</p></div> : null}
        {!error && !isLoading && visibleProducts.length ? <ProductList products={visibleProducts} /> : null}
        <nav className="pagination" aria-label="Product pagination"><button className="text-button" disabled={page <= 1} onClick={() => updateUrl({ page: String(page - 1) })}>Previous</button><span>Page {page} of {pageCount}</span><button className="text-button" disabled={page >= pageCount} onClick={() => updateUrl({ page: String(page + 1) })}>Next</button></nav>
      </section>
    </main>
  );
}
