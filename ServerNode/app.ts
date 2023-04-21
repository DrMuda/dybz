import express from "express"
import bodyParser from "body-parser"
import urls, { ApiPath } from "./src/urls"

const app = express()
// 解析 application/json
app.use(bodyParser.json({ limit: "50mb" }))
// 解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))
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

  console.log(`应用实例，访问地址为 http://${address}:${port}`)
})
