import api from "./request";
import { SearchBookParams, SearchBookRes } from './serverApiTypes';

/** 通过关键字搜书，非书架上的书籍 */
export const searchBookList = (params:SearchBookParams): Promise<SearchBookRes> => {
  return api({ url: "/api/searchBook", method: "get", params });
};
