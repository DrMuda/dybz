module.exports = {
  getPuppeteerConfig() {
    if (process.env.NODE_ENV === "production") {
      return {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath:
          "/home/software/chromium/linux-982053/chrome-linux/chrome",
      };
    } else {
      return {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      };
    }
  },
};
