import { ResSendData } from "../type"

export const sleep = (duration: number) => {
  return new Promise((r) => {
    setTimeout(r, duration)
  })
}

export const puppeteerError: ResSendData = {
  status: "error",
  data: null,
  message: "Puppeteer error"
}
