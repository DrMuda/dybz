const Users = require("./utils/Users.js")
const OldNewKey = require("./utils/OldNewKey.js")
const ImgAndChar = require("./utils/ImgAndChar.js")
const Log = require("./utils/Log")
const getDHTML = require("./utils/getDHTML.js")
const getSearchDHTML = require("./utils/getSearchDHTML.js")

async function pushCache(req, res) {
  let { oldNewKey, imgAndChar, user } = req.body.data || {}
  // imgAndChar = JSON.parse(unZip(imgAndChar));
  // oldNewKey = JSON.parse(unZip(oldNewKey) || "{}");
  const { userName, password } = req.body || {}
  Log.info(`pushCache: ${userName} ${password}`)
  if (user) {
    if (userName) {
      Users.setUser(userName, password, user).then((status) => {
        if (typeof status === "boolean") {
          res.send({ status: status ? "success" : "file io fail" })
        } else {
          res.send({ status })
        }
      })
    } else {
      res.send({ status: "user error" })
    }
  } else {
    res.send({ status: "push imgAndChar or oldNewKey" })
  }
  if (imgAndChar) {
    ImgAndChar.set({
      ...ImgAndChar.get(),
      ...imgAndChar
    })
  }
  if (oldNewKey) {
    OldNewKey.set({
      ...OldNewKey.get(),
      ...oldNewKey
    })
  }
}

async function pullUser(req, res) {
  const { userName, password } = req.query
  Log.info(`pullCache: ${userName} ${password}`)
  const user = await Users.getUser(userName, password)
  const data = { status: undefined, user }
  if (typeof user === "string") {
    data.user = null
    data.status = user
  } else {
    data.status = "success"
  }
  res.send(data)
}

async function pullOldNewKey(req, res) {
  let { page, size } = req.query
  page = parseInt(page)
  size = parseInt(size)
  const totalPage = OldNewKey.getTotalPage(size)
  const oldNewKey = await OldNewKey.getByPage(page, size)
  const data = { status: "success", oldNewKey, totalPage, page }
  res.send(data)
}

async function pullImgAndChar(req, res) {
  let { page, size } = req.query
  page = parseInt(page)
  size = parseInt(size)
  const totalPage = ImgAndChar.getTotalPage(size)
  const imgAndChar = await ImgAndChar.getByPage(page, size)
  const data = { status: "success", imgAndChar, totalPage, page }
  res.send(data)
}

async function reptileDHTML(req, res) {
  const { url } = req.body
  Log.info(`reptileDHTML: ${url}`)
  const content = await getDHTML(url)
  res.send({ status: "success", content })
}
async function search(req, res) {
  const { url, searchValue } = req.body
  Log.info(`searchDHTML: ${url} ${searchValue}`)
  const content = await getSearchDHTML(url, searchValue)
  res.send({ status: "success", content })
}

module.exports = {
  "/sync/pushCache": {
    method: "post",
    message: pushCache
  },
  "/sync/pullUser": {
    method: "get",
    message: pullUser
  },
  "/sync/pullImgAndChar": {
    method: "get",
    message: pullImgAndChar
  },
  "/sync/pullOldNewKey": {
    method: "get",
    message: pullOldNewKey
  },
  "/reptileDHTML": {
    method: "post",
    message: reptileDHTML
  },
  "/search": {
    method: "post",
    message: search
  }
}
