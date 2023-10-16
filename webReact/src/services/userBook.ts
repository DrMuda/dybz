import { ResSendData } from "../types";
import api from "./request";
import {
  DelBookParams,
  EditBookParams,
  GetBookListParams,
  GetBookListRes,
} from "./serverApiTypes";

export const getBookList = (
  params: GetBookListParams
): Promise<GetBookListRes> => {
  return api({ method: "get", params, url: "/api/getBookList" });
};
// 更新与新增书籍
export const editBook = (data: EditBookParams): Promise<ResSendData> => {
  return api({ method: "post", data, url: "/api/editBook" });
};
export const delBook = (data: DelBookParams): Promise<ResSendData> => {
  return api({ method: "post", url: "/api/delBook", data });
};
