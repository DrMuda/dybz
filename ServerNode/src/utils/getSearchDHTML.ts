import Log from "./Log"
import initPuppeteer from "./initPuppeteer"
import { sleep } from "./utils"
import { WherePages, waitPage } from "./waitPage"

type ThatWherePages = WherePages | "isSearchPage" | "isSearchList"
export default async (url: string, searchValue: string) => {
  const { page, browser } = await initPuppeteer()
  try {
    await page.goto(url)
    let content = await page.content()
    const waitSearchPage = async (): Promise<ThatWherePages> => {
      await page.waitForSelector(".search-form")
      return "isSearchPage"
    }
    await waitPage(page, { isSearchPage: waitSearchPage() })
    await page.evaluate((searchValue) => {
      const searchValueInput = document.querySelector(".text-border.vm") as HTMLInputElement
      const searchValueBtn = document.querySelector(".btn") as HTMLButtonElement
      if (searchValueInput && searchValueBtn) {
        searchValueInput.value = searchValue + ""
        searchValueBtn.click()
      }
      return new Promise((resolve) => {
        window.onload = resolve
      })
    }, searchValue)
    await sleep(1000)
    console.log("2221")
    page.waitForSelector(".pagelistbox").then(() => {
      console.log("????")
    })
    // console.log("!!!")
    // content = await page.content()
    // console.log("\\\\")
    // console.log(browser._targets)
    // page.close()
    // console.log(await page.content())
    // browser.close()
    // console.log(await page.content())
    // return content
  } catch (error) {
    Log.error(error as string)
    return `<body><div class='neirong'>server error: ${error}</div></body>`
  }
}
