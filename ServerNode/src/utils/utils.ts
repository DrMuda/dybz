import { ResSendData } from "../types"

export const sleep = (duration: number) => {
  return new Promise((r) => {
    setTimeout(r, duration)
  })
}

export const puppeteerError: ResSendData = {
  status: "error",
  message: "Puppeteer error"
}
export const userNoExistError: ResSendData = {
  status: "error",
  message: "user not exist"
}
export const userError: ResSendData = {
  status: "error",
  message: "user password invalid"
}

export const dateFormat = "YYYY-MM-DD HH:mm:ss"

export const parseUrl = (url: string) => {
  const domainTest = /^http(s)?:\/\/.*\.[a-z]+\//;
  const domainMatch = url.match(domainTest);
  const domain = domainMatch?.[0] || null;
  url = url.replace(domain || "", "/");
  const [path, ...search] = url.split("?");
  return {
    domian: domain?.replace(/\/$/, ""),
    path,
    search: search.join("?"),
  };
};

