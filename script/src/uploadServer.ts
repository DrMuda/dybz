import uploadFileToServer from "./uploadFileToServer";
import execCommandRemote from "./execCommandRemote.js";
import { exit } from "process";
import { getEnv } from "./utils";

const { serverLocalPath, serverRemotePath } = getEnv() || {};
if (!(serverLocalPath && serverRemotePath)) exit();
uploadFileToServer(serverLocalPath, serverRemotePath, async (client) => {
  if (!client) return;
  try {
    // 尝试重启pm2
    await execCommandRemote(
      "/home/software/node16/bin/pm2 restart app",
      client
    );
  } catch (error) {
    console.log(error);
    // 失败则直接启动
    const pathSplit = serverRemotePath.split("/");
    await execCommandRemote(
      `cd ${pathSplit.slice(0, pathSplit.length - 1).join("/")}`,
      client
    );
    await execCommandRemote(
      `/home/software/node16/bin/pm2 start app.js`,
      client
    );
  } finally {
    exit();
  }
});
