import puppeteer from "puppeteer"
import { getPuppeteerConfig } from "./utils"

export default async () => {
  const browser = await puppeteer.launch(getPuppeteerConfig())
  const page = await browser.newPage()
  page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36"
  )
  await page.setRequestInterception(true)
  await page.on("request", (interceptedRequest) => {
    //判断加载的url是否以jpg或png结尾，符合条件将不再加载
    if (interceptedRequest.url().endsWith(".jpg") || interceptedRequest.url().endsWith(".png")) {
      interceptedRequest.abort()
    } else {
      interceptedRequest.continue()
    }
  })
  return { browser, page }
}
