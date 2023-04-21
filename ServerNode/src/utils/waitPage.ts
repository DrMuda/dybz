import { Page } from "puppeteer"
import { sleep } from "./utils"

export type WherePages = "isChecking" | "isVerify" | "isTimeout" | "isSearchError" | "isCloudflare"

export const timeout = (): Promise<WherePages> => {
  return new Promise((r) => {
    setTimeout(() => {
      r("isTimeout")
    }, 40000)
  })
}
export const loopWait = async (
  page: Page,
  check: (content: string) => boolean,
  result: WherePages
) => {
  while (true) {
    const content = await page.content()
    if (check(content)) {
      return result
    }
    await sleep(100)
  }
}
export const waitCheckSafe = (content: string): boolean => {
  return !!content.match("检查站点是否安全")
}
export const waitVerify = (content: string): boolean => {
  return !!content.match("为防止恶意访问")
}
export const waitSearchError = (content: string): boolean => {
  return !!content.match("搜索间隔必须大于10秒")
}
export const waitCloudflare = (content: string): boolean => {
  return !!content.toLowerCase().match("cloudflare")
}

export const pagesAction = async (wherePages: WherePages, page: Page) => {
  switch (wherePages) {
    case "isChecking": {
      await page.waitForSelector("input")
      break
    }
    case "isVerify": {
      await page.type("input", "1234")
      await page.click("a")
      await page.waitForNavigation()
      return "end"
    }
    case "isTimeout": {
      throw new Error("isTimeout")
    }
  }
  return
}

type ThatWherePages = WherePages | (string & {})
export async function waitPage(
  page: Page,
  waitList: Record<string, Promise<string>>
): Promise<ThatWherePages> {
  const checkPage: ThatWherePages[] = ["isChecking", "isTimeout", "isVerify"]
  // 已等待过的页面
  let waitedPageList: ThatWherePages[] = []
  while (true) {
    const tempWaitList: Record<ThatWherePages, Promise<ThatWherePages>> = {
      isTimeout: timeout(),
      isChecking: loopWait(page, waitCheckSafe, "isChecking"),
      isVerify: loopWait(page, waitVerify, "isVerify"),
      isSearchError: loopWait(page, waitSearchError, "isSearchError"),
      isCloudflare: loopWait(page, waitCloudflare, "isCloudflare"),
      ...waitList
    }
    waitedPageList.forEach((waitedPage) => {
      console.log("delete", waitedPage)
      delete tempWaitList[waitedPage]
    })
    const wherePages = await Promise.race(Object.values(tempWaitList))
    waitedPageList.push(wherePages)
    console.log(wherePages)
    if (checkPage.includes(wherePages)) {
      await pagesAction(wherePages as WherePages, page)
    } else {
      return wherePages
    }
  }
}
