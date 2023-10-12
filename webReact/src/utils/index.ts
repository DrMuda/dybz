export const sleep = (delay: number) => {
  return new Promise((r) => {
    setTimeout(r, delay);
  });
};
