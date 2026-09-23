export type ApiError = {
  message: string;
  status?: number;
  code?: string;
};

export type PaginatedResponse<T> = {
  products: T[];
  total: number;
  skip: number;
  limit: number;
};