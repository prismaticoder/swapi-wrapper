export interface PaginatedResult<T> {
  total: number;
  per_page: number;
  previous: string;
  next: string;
  results: T[];
}
