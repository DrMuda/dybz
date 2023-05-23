import { Client, ClientErrorExtensions } from "ssh2";
import { getEnv } from "./utils";
import { exit } from "process";

export default (): Promise<{
  err?: Error & ClientErrorExtensions;
  client?: Client;
}> => {
  return new Promise((resolve) => {
    // 读取配置文件
    const { host, port, username, password } = getEnv() || {};
    if (!(host && port && username && password)) exit();
    const connectionSettings = { host, port, username, password };
    // 创建 SSH2 客户端
    const client = new Client();

    client.on("ready", () => {
      console.log("已连接到远程服务器");
      resolve({ err: undefined, client });
    });

    client.on("error", (err) => {
      console.error("连接错误:", err);
      resolve({ err, client: undefined });
    });

    client.on("end", () => {
      console.log("连接已关闭");
    });

    // 建立 SSH 连接
    client.connect(connectionSettings);
  });
};
