import Log from "../utils/Log"
import Users from "../utils/Users"
import { dateFormat, userError, userNoExistError } from "../utils/utils"
import { GetBookListRes, DelBookParams, EditBookParams, GetBookListParams } from "./types"
import createApi from "../utils/createApi"
import { ResSendData } from "../types"
import dayjs from 'dayjs'

const users = Users.getInstance()

export const getBookList = createApi<GetBookListParams, {}, GetBookListRes>(async (req, res) => {
  const { userId, userPassword } = req.query
  if (!userId || !userPassword) {
    res.send({ status: "error", message: "userId and userPassword is required" })
    return
  }

  const userRes = users.getUser(userId, userPassword)
  if (userRes === "not exist") {
    res.send(userNoExistError)
    return
  }
  if (userRes === "user error") {
    res.send(userError)
    return
  }
  res.send({
    data: userRes.bookList.filter((book) => !book.delete),
    status: "success"
  })
})

export const editBook = createApi<{}, EditBookParams, ResSendData>(async (req, res) => {
  const { user, book } = req.body
  if (!user || !book) {
    res.send({ status: "error", message: "user and book is required" })
    return
  }
  if (!user.id || !user.password) {
    res.send({
      status: "error",
      message: "user.id and user.password must string"
    })
    return
  }
  if (!book.id || !book.url || !book.name) {
    res.send({
      status: "error",
      message: "book.id must number, book.url and book.name must string"
    })
    return
  }

  const userRes = users.getUser(user.id, user.password)
  if (userRes === "user error") {
    res.send({ status: "error", message: userRes })
    return
  }
  if (userRes === "not exist") {
    users.setUser(user.id, {
      bookList: [{ ...book, lastUpdate: dayjs().format(dateFormat), delete: false }],
      lastUpdate: dayjs().format(dateFormat),
      password: user.password
    })
    Log.info(`create user:  ${user.id}; add book: ${book.id}`)
    res.send({ status: "success", message: "create user and add book" })
    return
  }
  const foundBook = userRes.bookList.find((_book) => book.id === _book.id)
  if (foundBook) {
    foundBook.name = book.name
    foundBook.url = book.url
    foundBook.historyUrl = book.historyUrl
    foundBook.lastUpdate = dayjs().format(dateFormat)
    users.setUser(user.id, userRes)
    Log.info(`user @${user.id} update book: ${book.id}`)
    res.send({ status: "success", message: "update book" })
    return
  }
  userRes.bookList.push({ ...book, lastUpdate: dayjs().format(dateFormat) })
  users.setUser(user.id, userRes)
  Log.info(`user @${user.id} add book: ${book.id}`)
  res.send({ status: "success", message: "add book" })
  return
})

export const delBook = createApi<{}, DelBookParams, ResSendData>(async (req, res) => {
  const { user, bookId } = req.body

  if (!user || !bookId) {
    res.send({ status: "error", message: "user and bookId is required" })
    return
  }
  if (!user.id || !user.password) {
    res.send({
      status: "error",
      message: "user.id and user.password must string"
    })
    return
  }

  const userRes = users.getUser(user.id, user.password)
  if (userRes === "not exist") {
    res.send(userNoExistError)
    return
  }
  if (userRes === "user error") {
    res.send(userError)
    return
  }

  const foundBook = userRes.bookList.find((book) => book.id === bookId)
  if (foundBook) {
    foundBook.delete = true
    foundBook.lastUpdate = dayjs().format(dateFormat)
  }
  users.setUser(user.id, {
    ...userRes,
    lastUpdate: dayjs().format(dateFormat)
  })
  Log.info(`@${user.id} del book: ${foundBook?.id}`)
  res.send({ status: "success", message: `del book` })
  return
})
