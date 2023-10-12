import Log from "./Log"
import PuppeteerSingleton from './PuppeteerSingle'
import { WherePages, waitPage } from "./waitPage"

const puppeteer = PuppeteerSingleton.getInstance()
type ThatWherePages = WherePages | "isTargetPage"
export default async (url: string, waitForSelector?: string) => {
  try {
    const page = await puppeteer.getPage()
    if(!page) return
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
    return content
  } catch (error) {
    Log.error(error as string)
    return `<body><div class='neirong'>server error: ${error}</div></body>`
  }
}
