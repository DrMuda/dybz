/* eslint-disable */
import {
  GetNovelHtmlRes,
  ImgAndCharValue,
  OldNewKey,
  PullImgAndCharRes,
  PullOldNewKeyRes,
  PullUserRes,
  RequestOCROption,
  User,
} from "@/utils/type";
import axios, { AxiosResponse, Canceler } from "axios";
import { Message } from "element-ui";

const pythonUrl = "/pythonApi/proxyRequest";
export function pushCache({
  data,
}: {
  data: {
    imgAndChar?: ImgAndCharValue;
    oldNewKey?: OldNewKey;
    user?: Pick<User, "novelList" | "ocrToken">;
  };
}) {
  const userName = localStorage.getItem("userName");
  const password = localStorage.getItem("password");

  if (!userName || !password) {
    Message({
      message: "先在设置中填写账号密码吧！",
      type: "warning",
      duration: 1000,
      showClose: true,
    });
  }
  return axios({
    url: "/nodeApi/sync/pushCache",
    method: "POST",
    data: {
      data,
      userName,
      password,
    },
  });
}

export function pullUser(): Promise<AxiosResponse<PullUserRes, any>> {
  const userName = localStorage.getItem("userName");
  const password = localStorage.getItem("password");
  if (!userName || !password) {
    Message({
      message: "先在设置中填写账号密码吧！",
      type: "warning",
      duration: 1000,
      showClose: true,
    });
  }
  return axios.get("/nodeApi/sync/pullUser", {
    params: { userName, password },
  });
}

export function pullImgAndChar(
  page: number,
  size: number
): Promise<AxiosResponse<PullImgAndCharRes, any>> {
  return axios.get("/nodeApi/sync/pullImgAndChar", {
    params: { page, size },
  });
}

export function pullOldNewKey(
  page: number,
  size: number
): Promise<AxiosResponse<PullOldNewKeyRes, any>> {
  return axios.get("/nodeApi/sync/pullOldNewKey", {
    params: { page, size },
  });
}

export function getNovelHtml(
  novelUrl: string,
  cancelTokenList: Array<Canceler>,
  chanel: string
): Promise<AxiosResponse<GetNovelHtmlRes, any>> {
  novelUrl = novelUrl.replace(".html", "");
  chanel = chanel || localStorage.getItem("chanel") || "";
  chanel = dealWithUrl(chanel);
  return axios({
    method: "get",
    url: "/nodeApi/getNovel",
    params: { url: `${chanel}${novelUrl}.html` },
    cancelToken: new axios.CancelToken((c) => {
      cancelTokenList.push(c);
    }),
  });
}

export function getImg(
  key: string,
  chanel?: string
): Promise<AxiosResponse<string | ArrayBuffer | null | undefined, any>> {
  chanel = chanel || localStorage.getItem("chanel") || "";
  chanel = dealWithUrl(chanel);
  return axios({
    method: "get",
    url: `/nodeApi/getImg`,
    params: { url: dealWithUrl(`${chanel}${key}`) },
    responseType: "blob",
    transformResponse: [
      async function (data) {
        return new Promise((resolve2, reject2) => {
          const fileReader = new FileReader();
          fileReader.onload = (e) => {
            resolve2(e?.target?.result);
          };
          // readAsDataURL
          fileReader.readAsDataURL(data);
          // fileReader.readAsArrayBuffer(data);
          fileReader.onerror = () => {
            reject2(new Error("blobToBase64 error"));
          };
        });
      },
    ],
  });
}

export function getChapter(
  novelUrl: string,
  currPage: number,
  chanel: string
): Promise<AxiosResponse<{ status: string; content: string }, any>> {
  novelUrl = novelUrl.replace(".html", "");
  chanel = chanel || localStorage.getItem("chanel") || "";
  chanel = dealWithUrl(chanel);
  return axios({
    method: "post",
    url: "/nodeApi/reptileDHTML",
    data: {
      url: `${chanel}${novelUrl}${currPage > 0 ? `_${currPage}` : ""}/`,
      waitForSelector: ".list",
    },
  });
}

export function getChanelList(): Promise<AxiosResponse<{ status: string; content: string }, any>> {
  return axios({
    method: "post",
    url: "/nodeApi/reptileDHTML",
    data: {
      url: localStorage.getItem("outOfContactUrl") || "http://www.01bz.xyz/",
      waitForSelector: ".line a",
    },
  });
}

export function requestOCR(options: RequestOCROption) {
  return axios(options);
}

export function search(
  url: string,
  searchValue: string,
  page: number
): Promise<AxiosResponse<GetNovelHtmlRes, any>> {
  return axios({
    method: "post",
    url: "/nodeApi/search",
    data: {
      url: dealWithUrl(url),
      searchValue,
      page,
    },
  });
}

function dealWithUrl(url: string) {
  if (url) {
    const hasHttp = url.includes("http://");
    const hasHttps = url.includes("https://");
    if (hasHttp || hasHttps) {
      return url;
    }
    return `http://${url}`;
  }
  return "";
}
