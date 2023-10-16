import api, { ApiResult } from "./request";

interface SearchBook {
  totalPage: number;
  bookList: { url: string; name: string }[];
}
/** 通过关键字搜书，非书架上的书籍 */
export const searchBookList = (params: {
  keyword: string;
  channel: string;
  page: number;
}): Promise<ApiResult<SearchBook>> => {
  return api({ url: "/api/searchBook", method: "get", params });
};

