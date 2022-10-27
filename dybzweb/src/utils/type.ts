import { AxiosRequestConfig } from "axios";

export type OldNewKey = Record<string, string>;
export type ImgAndCharItem = {
  char: string | undefined | null;
  img: string | undefined | null;
};
export type ImgAndCharValue = Record<string, ImgAndCharItem>;
export interface Novel {
  id: string;
  url: string;
  name: string;
  history: {
    title: string;
    url: string;
  };
  firstChapter: {
    title: string;
    url: string;
  };
  key: string;
  chanel: string;
}
export interface User {
  novelList: Novel[];
  ocrToken: string;
  password: string;
  lastUpdate: string;
}
export interface PullUserRes {
  status: "success" | "fail";
  user: User;
}
export interface PullImgAndCharRes {
  status: "success" | "fail";
  imgAndChar: ImgAndCharValue;
  totalPage: number;
  page: number;
}
export interface PullOldNewKeyRes {
  status: "success" | "fail";
  oldNewKey: OldNewKey;
  totalPage: number;
  page: number;
}
export interface RequestOCROption extends AxiosRequestConfig<null> {
  params: {
    access_token: string;
    image: string;
  };
}
