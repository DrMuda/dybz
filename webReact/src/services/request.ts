import axios, { AxiosError } from "axios";

const api = axios.create({
  timeout: 30000,
  responseType: "json",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.headers.set("timestamp", new Date().getTime());
  return config;
});
api.interceptors.response.use(
  async (response) => {
    return Promise.resolve(response.data);
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default api;
export interface ApiResult<Data = never> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  status: "success" | "error" | (string & {})
  message?: string
  data?: Data
}
export interface PaginationCofig{
  total: number;
  page: number;
  pageSize: number;
}
export interface PaginationResult<Data = never> {
  code: number;
  data: {
    records: Data[];
  } & PaginationCofig;
  msg?: string
}
