export default (htmlStr: string) => {
  // 清除空格，防止扰乱正则匹配
  htmlStr = htmlStr.replace(/\n/g, "");
  htmlStr = htmlStr.replace(/\r/g, "");
  // 防止转成dom时加载资源
  htmlStr = htmlStr.replace(/src/g, "my-src");
  const parser = new DOMParser();
  return parser.parseFromString(htmlStr, "text/html");
};
