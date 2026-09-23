export const API_BASE_URL = "https://dummyjson.com";

export const apiRoutes = {
  login: "/auth/login",
  products: "/products",
  productAdd: "/products/add",
  productSearch: "/products/search",
  productCategories: "/products/categories",
  productCategory: (category: string) => `/products/category/${category}`,
  product: (id: number | string) => `/products/${id}`,
} as const;