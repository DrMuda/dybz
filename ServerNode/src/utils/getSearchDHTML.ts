import Log from "./Log"
import PuppeteerSingleton from './PuppeteerSingle'
import { WherePages, waitPage } from "./waitPage"

const puppeteer = PuppeteerSingleton.getInstance()
type ThatWherePages = WherePages | "isSearchPage" | "isSearchResultPage"
export default async (url: string, searchValue: string, pageNumber: number) => {
  try {
    const page = await puppeteer.getPage()
    if(!page) return
    await page.goto(url)
    const waitSearchPage = async (): Promise<ThatWherePages> => {
      await page.waitForSelector(".search-form")
      return "isSearchPage"
    }
    await waitPage(page, { isSearchPage: waitSearchPage() })
    await page.evaluate(
      ({ searchValue, pageNumber }) => {
        ;(window as any).formPost?.("/s.php", {
          type: "articlename",
          s: searchValue,
          page: pageNumber
        })
      },
      { searchValue, pageNumber }
    )
    const waitSearchResultPage = async (): Promise<ThatWherePages> => {
      await page.waitForSelector(".page-title")
      await page.waitForSelector(".mod.block.book-all-list")
      return "isSearchResultPage"
    }
    await waitPage(page, { isSearchResultPage: waitSearchResultPage() })
    const content = await page.content()
    console.log("search end")
    return content
  } catch (error) {
    Log.error(error as string)
    return `<body><div class='neirong'>server error: ${error}</div></body>`
  }
}
