import { Client, ClientCallback } from "ssh2";

export default (command: string, client: Client, callback?: ClientCallback) => {
  console.log(`远程执行命令：${command}`);
  return new Promise<void>((resolve, reject) => {
    client.exec(command, (err, stream) => {
      callback?.(err, stream);
      if (err) {
        reject(err);
        return;
      }

      stream.on("close", (code: any, signal: any) => {
        console.log(`退出码: ${code}, 信号: ${signal}`);
        if (code && code !== 0) {
          reject(
            new Error(`远程命令执行失败，退出码: ${code}, 信号: ${signal}`)
          );
        } else {
          resolve();
          console.log(`远程命令执行成功， 退出码: ${code}, 信号: ${signal}`);
        }
      });
      stream.on("data", (data: any) => {
        console.log(`${data}`);
      });

      stream.stderr.on("data", (data) => {
        console.error(`远程命令执行错误: ${data}`);
        reject(new Error("远程命令执行错误"));
      });
    });
  });
};
