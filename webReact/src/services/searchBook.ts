import { User } from "../hooks/useUser";
import { sleep } from "../utils";
import { Book } from "./home";
import api, { ApiResult } from "./request";

interface SearchBook {
  url: string;
  name: string;
}
/** 通过关键字搜书，非书架上的书籍 */
export const searchBookList = (params: {
  keyword: string;
  chanel: string;
}): Promise<ApiResult<SearchBook[]>> => {
  return new Promise((resolve) => {
    sleep(2000).then(() => {
      resolve({
        code: 0,
        data: [
          { name: "测试1", url: "test" },
          { name: "测试2", url: "test" },
          { name: "测试3", url: "test" },
          { name: "测试4", url: "test" },
        ],
        msg: "",
      });
    });
  });
  return api({ method: "get", params });
};

// 从搜索页面添加书籍
export const addBook = (
  data: {
    user: User;
  } & Book
): Promise<ApiResult> => {
  return api({ method: "post", data });
};
