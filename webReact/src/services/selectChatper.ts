import api from "./request";
import { GetChatperListParams, GetChatperListRes } from "./serverApiTypes";

export const getChatperList = (
  params: GetChatperListParams
): Promise<GetChatperListRes> => {
  return api({ method: "get", url: "/api/getChatperList", params });
};
