import { Book, ResSendData } from "../types";

// 获取用户的书籍
export interface GetBookListParams {
  userId: string;
  userPassword: string;
}
export interface GetBookListRes extends ResSendData {
  data?: Book[];
}
export interface EditBookParams {
  user: {
    id: string;
    password: string;
  };
  book: Book;
}
export interface DelBookParams {
  user: {
    id: string;
    password: string;
  };
  bookId: Book["id"];
}

// 搜索书籍
export interface SearchBookParams {
  keyword: string;
  channel: string;
  page: number;
}
export interface SearchBookRes extends ResSendData {
  data?: {
    totalPage: number;
    bookList: {
      name: string;
      url: string;
    }[];
  };
}

// 获取路线列表
export interface GetChannelListParams {
  channelPageUrl: string;
}
export interface GetChannelListRes extends ResSendData {
  data?: string[];
}

// 获取章节列表
export interface GetChatperListParams {
  page: number;
  url: string;
}
export interface Chatper {
  title: string;
  /** 无 domain */
  url: string;
}
export interface GetChatperListRes extends ResSendData {
  data?: { chatperList: Chatper[]; totalPage: number };
}

// 获取单页书籍
export interface GetBookPageContentParams {
  url: string;
}
export interface GetBookPageContentRes extends ResSendData {
  data?: {
    chapterUrl: string;
    contentList: string[];
    pageList: string[];
    nextUrl: string;
    preUrl: string;
  };
}
