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
  return axios({
    method: "post",
    url: "/nodeApi/reptileDHTML",
    data: {
      url: `http://${chanel || localStorage.getItem("chanel")}${novelUrl}.html`,
    },
    cancelToken: new axios.CancelToken((c) => {
      cancelTokenList.push(c);
    }),
  });
}

export function getImg(
  key: string,
  chanel?: string
): Promise<AxiosResponse<string | ArrayBuffer | null | undefined, any>> {
  return axios({
    method: "post",
    url: pythonUrl,
    data: {
      method: "get",
      url: `http://${chanel || localStorage.getItem("chanel")}${key}`,
    },
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
): Promise<AxiosResponse<Promise<string | ArrayBuffer | null>, any>> {
  novelUrl = novelUrl.replace(".html", "");
  return axios({
    method: "post",
    url: pythonUrl,
    data: {
      url: `http://${chanel || localStorage.getItem("chanel")}${novelUrl}${
        currPage > 0 ? `_${currPage}` : ""
      }/`,
      method: "get",
    },
    responseType: "blob",
    transformResponse: [
      function (data) {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.readAsText(data, "GBK");
          fileReader.onload = function () {
            resolve(fileReader.result);
          };
          fileReader.onerror = () => {
            reject(new Error("file reader error"));
          };
        });
      },
    ],
  });
}

export function getChanelList(): Promise<AxiosResponse<string, any>> {
  return axios({
    method: "post",
    url: pythonUrl,
    data: {
      method: "get",
      url: localStorage.getItem("outOfContactUrl") || "http://accacc.xyz/",
    },
  });
}

export function requestOCR(options: RequestOCROption) {
  return axios(options);
}

export function search(
  url: string,
  searchValue: string
): Promise<AxiosResponse<GetNovelHtmlRes, any>> {
  return axios({
    method: "post",
    url: "/nodeApi/search",
    data: {
      url: "http://" + url + "/s.php",
      searchValue,
    },
  });
}
