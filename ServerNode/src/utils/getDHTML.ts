import Log from "./Log"
import initPuppeteer from "./initPuppeteer"
import { WherePages, waitPage } from "./waitPage"

type ThatWherePages = WherePages | "isTargetPage"
export default async (url: string, waitForSelector?: string) => {
  try {
    const { page, browser } = await initPuppeteer()
    await page.goto(url)
    const waitTargetPage = async (): Promise<ThatWherePages> => {
      if (waitForSelector) {
        await page.waitForSelector(waitForSelector)
      } else {
        await page.waitForTimeout(1000)
      }
      return "isTargetPage"
    }
    await waitPage(page, { isTargetPage: waitTargetPage() })
    const content = await page.content()
    await page.close()
    await browser.close()
    return content
  } catch (error) {
    Log.error(error as string)
    return `<body><div class='neirong'>server error: ${error}</div></body>`
  }
}
