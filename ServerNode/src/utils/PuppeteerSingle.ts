import puppeteer, { Browser, Page, KnownDevices } from "puppeteer"

class PuppeteerSingleton {
  private static instance: PuppeteerSingleton
  private browser: Browser | null = null

  private async init() {
    console.log("init puppeteer")
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--window-position=0,0",
        "--ignore-certifcate-errors",
        "--ignore-certifcate-errors-spki-list",
        "--disable-web-security"
      ],
      // headless: "new",
      headless: process.env.NODE_ENV === "production" ? true : false
    })
    this.browser = browser
  }

  public static getInstance(): PuppeteerSingleton {
    if (!PuppeteerSingleton.instance) {
      PuppeteerSingleton.instance = new PuppeteerSingleton()
    }
    return PuppeteerSingleton.instance
  }
  public async getBrowser(): Promise<Browser | null> {
    if (!this.browser) await this.init()
    return this.browser
  }
  public async newPage(): Promise<Page | null> {
    if (!this.browser) await this.init()

    const page = await this.browser?.newPage()
    if (!page) throw "new page error"
    page.emulate(KnownDevices["Galaxy S8"])
    await page.setRequestInterception(true)
    await page.setUserAgent(
      "Mozilla/5.0 (Linux; Android 7.0; SM-G950F Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/5.2 Chrome/51.0.2704.106 Mobile Safari/537.36"
    )
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false
      })
    })
    await page.on("request", (interceptedRequest) => {
      // 此图片不能阻止， 否则超时
      if (interceptedRequest.url().endsWith("jipin-default.jpg")) {
        interceptedRequest.continue()
        return
      }
      if (interceptedRequest.url().includes("/toimg/data")) {
        interceptedRequest.continue()
        return
      }
      //判断加载的url是否以jpg或png结尾，符合条件将不再加载
      if (
        interceptedRequest.url().endsWith(".jpg") ||
        interceptedRequest.url().endsWith(".png") ||
        interceptedRequest.url().endsWith(".gif")
      ) {
        interceptedRequest.abort()
        return
      }
      interceptedRequest.continue()
    })
    return page
  }
}

export default PuppeteerSingleton
