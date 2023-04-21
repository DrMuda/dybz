import { LaunchOptions, BrowserLaunchArgumentOptions, BrowserConnectOptions } from "puppeteer"

export const sleep = (duration: number) => {
  return new Promise((r) => {
    setTimeout(r, duration)
  })
}

export function getPuppeteerConfig(): LaunchOptions &
  BrowserLaunchArgumentOptions &
  BrowserConnectOptions {
  const args: BrowserLaunchArgumentOptions["args"] = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage"
  ]
  if (process.env.NODE_ENV === "production") {
    return {
      args,
      executablePath: "/home/software/chromium/linux-982053/chrome-linux/chrome"
    }
  } else {
    return {
      args
    }
  }
}
