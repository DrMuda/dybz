import api, { ApiResult } from "./request";

export function getChannelList(channelPageUrl: string):Promise<ApiResult<string[]>> {
  return api.get("/api/getChannelList", { params: { channelPageUrl } });
}
