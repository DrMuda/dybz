import dayjs from "dayjs"

const timeFomat = "YYYY-MM-DD HH:mm:ss x"

export default {
  
  error(message: string | NodeJS.ErrnoException) {
    const _message = `error(${dayjs().format(timeFomat)}): ${message}`
    console.error(_message)
  },

  info(message: string | NodeJS.ErrnoException) {
    const _message = `info(${dayjs().format(timeFomat)}): ${message}`
    console.log(_message)
  },

  warn(message: string | NodeJS.ErrnoException) {
    const _message = `warn(${dayjs().format(timeFomat)}): ${message}`
    console.warn(_message)
  },
}
