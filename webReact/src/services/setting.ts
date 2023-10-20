import api from "./request";
import { GetChannelListRes } from "./serverApiTypes";

export function getChannelList(
  channelPageUrl: string
): Promise<GetChannelListRes> {
  return api.get("/api/getChannelList", { params: { channelPageUrl } });
}
