export type ApiError = {
  message: string;
  status?: number;
};

export type PaginatedResponse<T> = {
  products: T[];
  total: number;
  skip: number;
  limit: number;
};