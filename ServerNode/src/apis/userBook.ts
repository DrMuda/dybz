import { Request, Response } from "express"
import Log from "../utils/Log"
import { Book, ResSendData } from "../types"
import Users from "../utils/Users"
import moment from "moment"
import { dateFormat, userError, userNoExistError } from "../utils/utils"
import { GetBookListRes, DelBookParams, EditBookParams, GetBookListParams } from "./types"

const users = Users.getInstance()

export const getBookList = async (req: Request, res: Response): Promise<void> => {
  const { userId, userPassword } = req.query as unknown as GetBookListParams
  if (!userId || !userPassword) {
    res.send({ status: "error", message: "userId and userPassword is required" } as ResSendData)
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
  } as GetBookListRes)
}

export const editBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user, book } = req.body as unknown as EditBookParams
    if (!user || !book) {
      res.send({ status: "error", message: "user and book is required" } as ResSendData)
      return
    }
    if (!user.id || !user.password) {
      res.send({
        status: "error",
        message: "user.id and user.password must string"
      } as ResSendData)
      return
    }
    if (!book.id || !book.url || !book.name) {
      res.send({
        status: "error",
        message: "book.id must number, book.url and book.name must string"
      } as ResSendData)
      return
    }

    const userRes = users.getUser(user.id, user.password)
    if (userRes === "user error") {
      res.send({ status: "error", message: userRes } as ResSendData)
      return
    }
    if (userRes === "not exist") {
      users.setUser(user.id, {
        bookList: [{ ...book, lastUpdate: moment().format(dateFormat), delete: false }],
        lastUpdate: moment().format(dateFormat),
        password: user.password
      })
      Log.info(`create user:  ${user.id}; add book: ${book.id}`)
      res.send({ status: "success", message: "create user and add book" } as ResSendData)
      return
    }
    const foundBook = userRes.bookList.find((_book) => book.id === _book.id)
    if (foundBook) {
      foundBook.name = book.name
      foundBook.url = book.url
      foundBook.history = book.history
      foundBook.lastUpdate = moment().format(dateFormat)
      users.setUser(user.id, userRes)
      Log.info(`user @${user.id} update book: ${book.id}`)
      res.send({ status: "success", message: "update book" } as ResSendData)
      return
    }
    userRes.bookList.push({ ...book, lastUpdate: moment().format(dateFormat) })
    users.setUser(user.id, userRes)
    Log.info(`user @${user.id} add book: ${book.id}`)
    res.send({ status: "success", message: "add book" } as ResSendData)
    return
  } catch (error) {
    Log.error(`${error}`)
    res.send({
      status: "error",
      message: `${error}`
    })
  }
}

export const delBook = async (req: Request, res: Response): Promise<void> => {
  const { user, bookId } = req.body as unknown as DelBookParams

  if (!user || !bookId) {
    res.send({ status: "error", message: "user and bookId is required" } as ResSendData)
    return
  }
  if (!user.id || !user.password) {
    res.send({
      status: "error",
      message: "user.id and user.password must string"
    } as ResSendData)
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
    foundBook.lastUpdate = moment().format(dateFormat)
  }
  users.setUser(user.id, {
    ...userRes,
    lastUpdate: moment().format(dateFormat)
  })
  Log.info(`@${user.id} del book: ${foundBook?.id}`)
  res.send({ status: "success", message: `del book` } as ResSendData)
  return
}
