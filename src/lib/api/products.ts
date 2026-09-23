import { apiClient } from "@/lib/api/client/axios";
import { apiRoutes } from "@/lib/api/routes";
import type { PaginatedResponse } from "@/lib/api/types";
import type {
  Product,
  ProductMutationInput,
  ProductQuery,
} from "@/lib/products/types";

export type ProductCategory = {
  slug: string;
  name: string;
  url: string;
};

type ProductListParams = {
  limit: ProductQuery["limit"];
  skip: number;
  sort?: ProductQuery["sort"];
  order?: ProductQuery["order"];
  signal?: AbortSignal;
};

export async function getProducts(
  params: ProductListParams,
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>(
    apiRoutes.products,
    { params, signal: params.signal },
  );
  return response.data;
}

export async function searchProducts(
  query: string,
  params: ProductListParams,
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>(
    apiRoutes.productSearch,
    {
      params: { q: query, limit: params.limit, skip: params.skip },
      signal: params.signal,
    },
  );
  return response.data;
}

export async function getProductCategories(
  signal?: AbortSignal,
): Promise<ProductCategory[]> {
  const response = await apiClient.get<ProductCategory[]>(
    apiRoutes.productCategories,
    { signal },
  );
  return response.data;
}

export async function getProductsByCategory(
  category: string,
  params: ProductListParams,
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>(
    apiRoutes.productCategory(category),
    { params, signal: params.signal },
  );
  return response.data;
}

export async function getProduct(
  id: number | string,
  signal?: AbortSignal,
): Promise<Product> {
  const response = await apiClient.get<Product>(apiRoutes.product(id), { signal });
  return response.data;
}

export async function createProduct(input: ProductMutationInput): Promise<Product> {
  const response = await apiClient.post<Product>(apiRoutes.productAdd, input);
  return response.data;
}

export async function updateProduct(
  id: number | string,
  input: Partial<ProductMutationInput>,
): Promise<Product> {
  const response = await apiClient.put<Product>(apiRoutes.product(id), input);
  return response.data;
}

export async function deleteProduct(id: number | string): Promise<Product> {
  const response = await apiClient.delete<Product>(apiRoutes.product(id));
  return response.data;
}