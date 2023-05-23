import { FileEntry, InputAttributes, SFTPWrapper } from "ssh2";
import dotenv from "dotenv";
import fs from "fs";

export function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${date}${hours}${minutes}${seconds}`;
}

export function sftpReaddirSync(
  remotePath: string,
  sftp: SFTPWrapper
): Promise<{ err?: Error; list?: FileEntry[] }> {
  return new Promise((resolve) => {
    sftp.readdir(remotePath, (err, list) => {
      resolve({ err, list });
    });
  });
}

export function sftpMkdirSync(
  remoteFilePath: string,
  sftp: SFTPWrapper,
  attributes?: InputAttributes
): Promise<Error | null | undefined> {
  return new Promise((resolve) => {
    sftp.mkdir(remoteFilePath, attributes || {}, (err) => {
      resolve(err);
    });
  });
}

export function sftpExistsSync(
  remotePath: string,
  sftp: SFTPWrapper
): Promise<boolean> {
  return new Promise((resolve) => {
    sftp.exists(remotePath, (isExist) => {
      resolve(isExist);
    });
  });
}

export function getEnv():
  | {
      host: string;
      port: number;
      username: string;
      password: string;
      webLocalPath: string;
      webRemotePath: string;
      serverLocalPath: string;
      serverRemotePath: string;
    }
  | undefined {
  // 检查配置文件是否存在，如果不存在则生成默认配置文件
  const configPath = "./.env";
  if (!fs.existsSync(configPath)) {
    console.log("配置文件不存在，生成默认配置文件...");
    const str = `
host=默认远程服务器地址
port=22
username=默认用户名
password=默认密码
webLocalPath=网页默认本地路径
webRemotePath=网页默认远程路径
serverLocalPath=服务器默认本地路径
serverRemotePath=服务器默认本地路径`;
    fs.writeFileSync(configPath, str);
    console.log("默认配置文件已生成， 填写完成后再次尝试");
    return;
  }
  dotenv.config();
  return {
    host: process.env.host!,
    port: parseInt(process.env.port!),
    username: process.env.username!,
    password: process.env.password!,
    webLocalPath: process.env.webLocalPath!,
    webRemotePath: process.env.webRemotePath!,
    serverLocalPath: process.env.serverLocalPath!,
    serverRemotePath: process.env.serverRemotePath!,
  };
}
