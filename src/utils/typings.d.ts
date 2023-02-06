export interface Pagination {
  page: number;
  limit?: number;
}

export interface IFilter {
  [key: string]: any;
  page?: number;
  limit?: number;
}

export interface UsersFilter extends IFilter {
  name?: string;
  subjectClasses?: string;
}
