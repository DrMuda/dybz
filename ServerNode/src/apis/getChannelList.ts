import jsdom from "jsdom"
import { GetChannelListRes } from "./types"
import createApi from "../utils/createApi"
import axios from "axios"

const { JSDOM } = jsdom
export default createApi<{ channelPageUrl?: string }, {}, GetChannelListRes>(async (req, res) => {
  const { channelPageUrl } = req.query
  if (typeof channelPageUrl !== "string") {
    res.send({
      status: "error",
      message: "channelPageUrl must string"
    })
    return
  }
  // 这个页面可以直接请求, 用无头浏览器反而会被反爬虫
  const pageRes = await axios.get(channelPageUrl)
  const { document: doc } = new JSDOM(pageRes.data).window
  const aEleList = doc.querySelectorAll(".navigation-content .line a")
  const urlList: string[] = []
  aEleList?.forEach?.((ele) => {
    const href = ele.getAttribute("href")
    href && urlList.push(href)
  })
  res.send({
    status: "success",
    data: Array.from(new Set(urlList))
  })
})
