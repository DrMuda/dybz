import uploadFileToServer from "./uploadFileToServer.js";
import execCommandRemote from "./execCommandRemote.js";
import { exit } from "process";
import { getEnv } from "./utils.js";

const { webLocalPath, webRemotePath } = getEnv() || {};
if (!(webLocalPath && webRemotePath)) exit();
uploadFileToServer(webLocalPath, webRemotePath, async (client) => {
  if (!client) return;
  try {
    // 尝试重启nginx
    await execCommandRemote("nginx -s reload", client);
  } catch (error) {
    console.log(error);
    // 失败则直接启动
    await execCommandRemote("nginx", client);
  } finally {
    exit();
  }
});
