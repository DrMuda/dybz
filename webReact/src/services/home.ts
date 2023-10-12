import { User } from '../contexts/LocalStorageContext';
import { sleep } from "../utils";
import api, { ApiResult } from "./request";

interface Chapter {
  title?: string;
  url?: string;
}
export interface Book {
  id?: number;
  url?: string;
  name?: string;
  history?: Chapter;
  firstChapter?: Chapter;
  chanel?: string;
  key?: number;
  /** 用于排序, YYYY-MM-DD HH:mm:ss */
  lastTime?: string;
}
export const getBookList = (params: {
  user: User;
}): Promise<ApiResult<Book[]>> => {
  return new Promise((resolve) => {
    sleep(2000).then(() => {
      resolve({
        code: 0,
        data: [
          { id: 1, name: "测试1", url: "test" },
          { id: 2, name: "测试2", url: "test" },
          { id: 3, name: "测试3", url: "test" },
          { id: 4, name: "测试4", url: "test" },
        ],
        msg: "",
      });
    });
  });
  return api({ method: "get", params });
};
