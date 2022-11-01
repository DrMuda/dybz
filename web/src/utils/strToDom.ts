export default (str?: string | null): NodeListOf<ChildNode> | null[] => {
  try {
    const tempEle = document.createElement("div");
    str && (tempEle.innerHTML = str);
    return tempEle.childNodes;
  } catch (e) {
    console.error(e);
    return [null];
  }
};
