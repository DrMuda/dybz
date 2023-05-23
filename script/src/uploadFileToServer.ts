import fs from "fs";
import { exit } from "process";
import connectRemoteServer from "./connectRemoteServer";
import { Client, SFTPWrapper } from "ssh2";
import {
  getTimestamp,
  sftpExistsSync,
  sftpMkdirSync,
  sftpReaddirSync,
  getEnv,
} from "./utils";

type TCallBack = (client?: Client) => Promise<any>;
export default (localPath: string, remotePath: string, callback: TCallBack) => {
  connectRemoteServer().then(({ err, client }) => {
    if (!err && client) {
      client.sftp((err, sftp) => {
        if (err) {
          console.error("SFTP 连接错误:", err);
          client.end();
          return;
        }

        console.log("开始上传文件或文件夹...");
        upload(localPath, remotePath, sftp, async () => {
          console.log("上传完成");
          await callback(client);
          client.end();
        });
      });
    }
  });
};

async function upload(
  localPath: string,
  remotePath: string,
  sftp: SFTPWrapper,
  callback: TCallBack
) {
  const stats = fs.lstatSync(localPath);
  if (stats.isDirectory()) {
    await renameDirIfExists(remotePath, sftp);
    // 上传文件夹
    uploadDirectory(localPath, remotePath, sftp, callback);
  } else {
    await renameFileIfExists(remotePath, sftp);
    // 上传单个文件
    uploadFile(localPath, remotePath, sftp, callback);
  }
}

function uploadDirectory(
  localPath: string,
  remotePath: string,
  sftp: SFTPWrapper,
  callback: TCallBack
) {
  const files = fs.readdirSync(localPath);

  let fileCount = files.length;
  if (fileCount === 0) {
    // 如果文件夹为空，则直接返回
    return callback();
  }

  files.forEach(async (file) => {
    const filePath = `${localPath}/${file}`;
    const remoteFilePath = `${remotePath}/${file}`;

    const stats = fs.lstatSync(filePath);
    if (stats.isDirectory()) {
      // 递归上传子文件夹
      const err = await sftpMkdirSync(remoteFilePath, sftp);
      if (err) {
        console.error(`创建远程文件夹错误: ${err}`);
        exit();
      } else {
        console.log(`创建远程文件夹: ${remoteFilePath}`);
        uploadDirectory(filePath, remoteFilePath, sftp, async () => {
          fileCount--;
          if (fileCount === 0) {
            // 当所有文件上传完成后，执行回调函数
            callback();
          }
        });
      }
    } else {
      // 上传文件
      uploadFile(filePath, remoteFilePath, sftp, async () => {
        fileCount--;
        if (fileCount === 0) {
          // 当所有文件上传完成后，执行回调函数
          callback();
        }
      });
    }
  });
}

function uploadFile(
  localPath: string,
  remotePath: string,
  sftp: SFTPWrapper,
  callback: TCallBack
) {
  const readStream = fs.createReadStream(localPath);
  const writeStream = sftp.createWriteStream(remotePath);

  writeStream.on("close", () => {
    console.log(`上传文件: ${localPath} -> ${remotePath}`);
    callback();
  });

  writeStream.on("error", (err: any) => {
    console.error("文件上传错误:", err);
    callback();
  });

  readStream.pipe(writeStream);
}

async function renameFileIfExists(remotePath: string, sftp: SFTPWrapper) {
  const isExists = await sftpExistsSync(remotePath, sftp);
  if (isExists) {
    const [path, suffix] = remotePath.split(".");
    const renamedPath = `${path}${getTimestamp()}${suffix && "." + suffix}`;
    await sftp.rename(remotePath, renamedPath, () => {});
    console.log(`已将 ${remotePath} 重命名为 ${renamedPath}`);
  } else {
    // 远程路径不存在，无需重命名
    console.log(`远程路径 ${remotePath} 不存在`);
  }
}

async function renameDirIfExists(remotePath: string, sftp: SFTPWrapper) {
  const { err } = await sftpReaddirSync(remotePath, sftp);
  try {
    if (!err) {
      const path = remotePath;
      const renamedPath = `${path}${getTimestamp()}`;
      await sftp.rename(remotePath, renamedPath, () => {});
      console.log(`已将文件夹 ${remotePath} 重命名为 ${renamedPath}`);
    }
    sftpMkdirSync(remotePath, sftp);
    console.log(`创建远程文件夹: ${remotePath}`);
  } catch (err) {
    console.error(`重命名远程文件夹 ${remotePath} 错误:`, err);
    exit();
  }
}
