import connectRemoteServer from "./connectRemoteServer";
import execCommandRemote from "./execCommandRemote.js";
connectRemoteServer().then(({ err, client }) => {
  if (!err && client) {
    execCommandRemote(
      "pm2 ps",
      client,
      (err, stream) => {
        if (err) throw err;
        stream.on("data", (data: any) => {
          console.log("Current user with sudo:", data.toString());
        });
        stream.on("close", (code: any, signal: any) => {
          console.log("Exit code:", code);
          client.end();
        });
      }
    );
  }
});
