import api from "./request";
import { GetBookPageContentParams, GetBookPageContentRes } from "./serverApiTypes";

export function getBookPageContent(
  params: GetBookPageContentParams
): Promise<GetBookPageContentRes> {
  return api.get("/api/getBookPageContent", { params });
}
