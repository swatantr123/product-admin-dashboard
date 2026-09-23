export type ProductReview = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
};

export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: ProductReview[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  images: string[];
  thumbnail: string;
};

export type ProductSortField = "title" | "price" | "rating";

export type ProductQuery = {
  page: number;
  limit: 10 | 20 | 50;
  search: string;
  category: string;
  sort: ProductSortField;
  order: "asc" | "desc";
};

export type ProductMutationInput = {
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  thumbnail?: string;
};