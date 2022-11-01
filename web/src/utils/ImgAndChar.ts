import { ImgAndCharItem, ImgAndCharValue } from "./type";

class ImgAndChar {
  imgAndChar: ImgAndCharValue = {};
  constructor() {
    this._refresh();
  }

  // 从缓存中更新imgAndChar(reverse === false)或更新到缓存(reverse === true)
  _refresh(reverse?: boolean | undefined): void {
    if (reverse) {
      localStorage.setItem("imgAndChar", JSON.stringify(this.imgAndChar));
    } else {
      const str = localStorage.getItem("imgAndChar");
      if (!str) {
        this.imgAndChar = {};
        localStorage.setItem("imgAndChar", "{}");
      } else {
        try {
          this.imgAndChar = JSON.parse(str);
        } catch (error) {
          this.imgAndChar = {};
          localStorage.setItem("imgAndChar", "{}");
        }
      }
    }
  }

  get(): ImgAndCharValue {
    return this.imgAndChar;
  }

  getByKey(key: string): ImgAndCharItem {
    return this.imgAndChar[key];
  }

  set(newImgAndChar: ImgAndCharValue): void {
    this.imgAndChar = newImgAndChar;
    this._refresh(true);
  }

  setByKey(key: string, value: ImgAndCharItem): void {
    this.imgAndChar[key] = value;
    this._refresh(true);
  }

  setCharByKey(key: string, char: string): void {
    if (!this.imgAndChar[key]) {
      this.imgAndChar[key] = { char: null, img: null };
    }
    this.imgAndChar[key].char = char;
    this._refresh(true);
  }

  setImgByKey(key: string, img: string): void {
    if (!this.imgAndChar[key]) {
      this.imgAndChar[key] = { char: null, img: null };
    }
    this.imgAndChar[key].img = img;
    this._refresh(true);
  }
}

export default new ImgAndChar();
