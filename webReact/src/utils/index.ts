export const sleep = (delay: number) => {
  return new Promise((r) => {
    setTimeout(r, delay);
  });
};

export const parseUrl = (url: string) => {
  const domainTest = /^http(s)?:\/\/.*\.[a-z]+\//;
  const domainMatch = url.match(domainTest);
  const domain = domainMatch?.[0] || null;
  url = url.replace(domain || "", "/");
  const [path, ...search] = url.split("?");
  return {
    domian: domain?.replace(/\/$/, ""),
    path,
    search: search.join("?"),
  };
};
