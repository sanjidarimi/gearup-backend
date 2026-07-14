export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
}

type TMeta = {
  pages: number;
  limits: number;
  total: number;
};
export type TResponseData<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: TMeta;
};
