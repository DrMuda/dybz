import express from "express"
import urls from "./src/urls"
import PuppeteerSingle from "./src/utils/PuppeteerSingle"

const app = express()
// 解析 application/json
app.use(express.json({ limit: "50mb" }))
// 解析 application/x-www-form-urlencoded
app.use(express.urlencoded({ limit: "50mb", extended: true }))
Object.entries(urls).forEach(([path, { method, message }]) => {
  switch (method) {
    case "post": {
      app.post(path, message)
      break
    }
    default: {
      app.get(path, message)
    }
  }
})

const server = app.listen(8010, "0.0.0.0", function () {
  const { address, port } = server.address() as { address: string; family: string; port: number }
  PuppeteerSingle.getInstance().getBrowser()
  console.log(`应用实例，访问地址为 http://${address}:${port}`)
})
