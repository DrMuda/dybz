import api, { ApiResult } from './request';

export interface BookPageContent{
  chatperUrl: string
  preChatperUrl: string,
  nextChatperUrl: string,
  pageUrlList: string[],
  content: string[]
}
export function getBookPageContent(bookUrl: string):Promise<ApiResult<BookPageContent>>{
  return api.get("", {params:{bookUrl}})
}