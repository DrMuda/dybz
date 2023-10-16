import { Page } from "puppeteer"
import { sleep } from "./utils"

export type WherePages =
  | "isChecking"
  | "isVerify"
  | "isTimeout"
  | "isSearchError"
  | "isCloudflare"
  | "isLoading"
  | "isEmptySearch"
  | "isPageNoFound"

export const timeout = (): Promise<WherePages> => {
  // 兜底， 防止一直等待
  return new Promise((r) => {
    setTimeout(() => {
      r("isTimeout")
    }, 29000)
  })
}
export const loopWait = async (
  page: Page,
  check: (content: string) => boolean,
  result: WherePages
) => {
  while (true) {
    try {
      // 一般就是跳转后立即获取content就会报错， 可以表明正在跳转
      const content = await page.content()
      if (check(content)) {
        return result
      }
      await sleep(100)
    } catch (error) {
      return "isLoading"
    }
  }
}
export const waitEmptySearch = (content: string): boolean => {
  return !!content.match("搜索无结果")
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
export const waitPageNoFound = (content: string): boolean => {
  return !!content.toLowerCase().match("404 Not Found")
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
      await sleep(500)
      await page.click("a")

      // await Promise.allSettled([page.waitForNavigation(), ])
      break
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
    const tempWaitList: Partial<Record<ThatWherePages, Promise<ThatWherePages>>> = {
      isTimeout: timeout(),
      isChecking: loopWait(page, waitCheckSafe, "isChecking"),
      isVerify: loopWait(page, waitVerify, "isVerify"),
      isSearchError: loopWait(page, waitSearchError, "isSearchError"),
      isCloudflare: loopWait(page, waitCloudflare, "isCloudflare"),
      isEmptySearch: loopWait(page, waitEmptySearch, "isEmptySearch"),
      isPageNoFound: loopWait(page, waitPageNoFound, "isPageNoFound"),
      ...waitList
    }
    delete tempWaitList["isLoading"]
    waitedPageList.forEach((waitedPage) => {
      console.log("delete", waitedPage)
      delete tempWaitList[waitedPage]
    })
    const wherePages = await Promise.race(Object.values(tempWaitList))
    switch (wherePages) {
      case "isLoading": {
      }
      case undefined: {
        continue
      }
      case "isTimeout": {
        throw new Error("超时了")
      }
      case "isEmptySearch": {
        throw new Error("搜索无结果")
      }
      default: {
        waitedPageList.push(wherePages)
        console.log(wherePages)
        if (checkPage.includes(wherePages)) {
          await pagesAction(wherePages as WherePages, page)
        } else {
          return wherePages
        }
      }
    }
  }
}
