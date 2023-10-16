import puppeteer, { Browser, Page, KnownDevices } from "puppeteer"

class PuppeteerSingleton {
  private static instance: PuppeteerSingleton
  private browser: Browser | null = null
  private page: Page | null = null

  private async init() {
    console.log("init puppeteer")
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--window-position=0,0",
        "--ignore-certifcate-errors",
        "--ignore-certifcate-errors-spki-list",
        "--disable-web-security"
      ],
      headless: "new",
      // headless: false,
      executablePath:
        process.env.NODE_ENV === "production"
          ? "../Chromium.app"
          : undefined
    })
    const page = await browser.newPage()
    page.emulate(KnownDevices["Galaxy Note 3"])
    await page.setRequestInterception(true)
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
    this.browser = browser
    this.page = page
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
  public async getPage(): Promise<Page | null> {
    if (!this.page) await this.init()
    return this.page
  }
}

export default PuppeteerSingleton
