"use client";

import { FormEvent, useState } from "react";
import type { ProductMutationInput } from "@/lib/products/types";

type ProductFormProps = {
  initialValues?: ProductMutationInput;
  submitLabel: string;
  onSubmit: (values: ProductMutationInput) => Promise<void>;
};

export function ProductForm({ initialValues, submitLabel, onSubmit }: ProductFormProps) {
  const [values, setValues] = useState<ProductMutationInput>(initialValues ?? {
    title: "",
    description: "",
    category: "",
    price: 0,
    stock: 0,
    thumbnail: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field: keyof ProductMutationInput, value: string) {
    setValues((current) => ({
      ...current,
      [field]: field === "price" || field === "stock" ? Number(value) : value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    if (!values.title.trim() || !values.description.trim() || !values.category.trim() || values.price < 0 || values.stock < 0) {
      setError("Add a title, description, category, and non-negative price and stock values.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit({ ...values, title: values.title.trim(), description: values.description.trim(), category: values.category.trim() });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save this product.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <label>Title<input value={values.title} onChange={(event) => update("title", event.target.value)} /></label>
      <label>Description<textarea value={values.description} onChange={(event) => update("description", event.target.value)} rows={5} /></label>
      <div className="form-grid"><label>Category<input value={values.category} onChange={(event) => update("category", event.target.value)} /></label><label>Price<input type="number" min="0" step="0.01" value={values.price} onChange={(event) => update("price", event.target.value)} /></label><label>Stock<input type="number" min="0" value={values.stock} onChange={(event) => update("stock", event.target.value)} /></label></div>
      <label>Thumbnail URL <span className="field-hint">optional</span><input value={values.thumbnail ?? ""} onChange={(event) => update("thumbnail", event.target.value)} /></label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : submitLabel}</button>
    </form>
  );
}