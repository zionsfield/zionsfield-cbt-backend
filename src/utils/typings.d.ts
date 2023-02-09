import { SubjectClassDoc } from "../schemas/subjectClasses.schema";

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

export interface UpdateTeacherDto {
  name: string;
  email: string;
  subjectClasses: SubjectClassDoc[];
}
