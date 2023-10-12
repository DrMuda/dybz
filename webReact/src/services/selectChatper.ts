import { User } from "../hooks/useUser";
import { Book } from "./home";
import api, { ApiResult, PaginationCofig, PaginationResult } from "./request";

interface BookChatper {
  title: string;
  url: string;
}
export const getBookChatperList = (
  params: {
    bookUrl: string;
  } & Omit<PaginationCofig, "total">
): Promise<PaginationResult<BookChatper>> => {
  return new Promise((resolve) => {
    resolve({
      code: 0,
      data: {
        page: 1,
        total: 3,
        pageSize: 100,
        records: [
          { title: "chatper1", url: "1" },
          { title: "chatper2", url: "2" },
          { title: "chatper3", url: "3" },
        ],
      },
    });
  });
  return api({ method: "get", params });
};

export const updateBook = (data: { user: User } & Book): Promise<ApiResult> => {
  return api({ method: "post", data });
};
