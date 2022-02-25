/*
 * @Author: LXX
 * @Date: 2022-02-25 14:55:28
 * @LastEditTime: 2022-02-25 16:56:18
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzWeb\src\components\Home.d.ts
 */
export interface Novel {
    title?: string;
    mainContext?: Array<string | undefined | null>;
    pages?: Array<string | undefined | null>;
    currPage?: string | nulll;
    prev?: string | null;
    next?: string | null;
    [key: string]: any;
}
export interface ImgMap {
    [key: string]: string | null;
}
