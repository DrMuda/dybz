/*
 * @Author: LXX
 * @Date: 2022-03-21 10:04:34
 * @LastEditTime: 2022-03-21 11:24:06
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\utils\ImgAndChar.ts
 */
type Item = {
    char: string | undefined | null;
    img: string | undefined | null;
};
type ImgAndCharValue = {
    [key: string]: Item;
};

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

    getByKey(key: string): Item {
        return this.imgAndChar[key];
    }

    set(newImgAndChar: ImgAndCharValue): void {
        this.imgAndChar = newImgAndChar;
        this._refresh(true);
    }

    setByKey(key: string, value: Item): void {
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
