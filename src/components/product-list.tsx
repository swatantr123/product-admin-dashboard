import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products/types";

export function ProductList({ products }: { products: Product[] }) {
  return (
    <>
      <div className="product-table-wrap desktop-products">
        <table>
          <caption className="sr-only">Product catalog</caption>
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Rating</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>{products.map((product) => <tr key={product.id}><td><ProductLink product={product} /></td><td>{product.category}</td><td>${product.price.toFixed(2)}</td><td>{product.rating.toFixed(1)}</td><td>{product.stock}</td><td><Link className="text-button" href={`/products/${product.id}/edit`}>Edit</Link></td></tr>)}</tbody>
        </table>
      </div>
      <div className="mobile-products" aria-label="Product catalog cards">
        {products.map((product) => <article className="product-card" key={product.id}><ProductLink product={product} /><dl><div><dt>Category</dt><dd>{product.category}</dd></div><div><dt>Price</dt><dd>${product.price.toFixed(2)}</dd></div><div><dt>Rating</dt><dd>{product.rating.toFixed(1)}</dd></div><div><dt>Stock</dt><dd>{product.stock}</dd></div></dl><Link className="card-action" href={`/products/${product.id}/edit`}>Edit product <span aria-hidden="true">→</span></Link></article>)}
      </div>
    </>
  );
}

function ProductLink({ product }: { product: Product }) {
  return <Link className="product-name" href={`/products/${product.id}`}>{product.thumbnail ? <Image src={product.thumbnail} alt="" width={48} height={48} /> : <span className="product-image-placeholder" aria-hidden="true" /> }<strong>{product.title}</strong></Link>;
}