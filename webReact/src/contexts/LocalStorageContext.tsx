import React, { ReactNode } from "react";
import { useLocalStorage } from "react-use";
import { localStorageKey } from "../config";
import imgAndChar from "../../../data/imgAndChar.json";
import oldNewKey from "../../../data/oldNewKey.json";

const key = localStorageKey;
export interface User {
  name?: string;
  password?: string;
}
export interface Ocr {
  accessToken?: string;
  type?: "general_basic" | "general" | "accurate_basic" | "accurate";
}
export interface Md5ToCharMap {
  [md5: string]: {
    char: string;
    img: string;
  };
}
interface ContextValue {
  user?: User;
  setUser: (user: User) => void;
  ocr?: Ocr;
  setOcr: (ocr: Ocr) => void;
  imgIdToMd5Map?: Record<string, string>;
  setImgIdToMd5Map: (value: Record<string, string>) => void;
  md5ToCharMap?: Md5ToCharMap;
  updateChar: (key: string, newChar: string, newImg?: string) => void;
  updateImgId: (imgId: string, imgMd5: string) => void;
  getCharByImgId: (imgId: string) => Md5ToCharMap[""] | null;
  defaultChannel?: string;
  setDefaultChannel: (value: string) => void;
  channelList?: string[];
  setChannelList: (value: string[]) => void;
}

const initValue: ContextValue = {
  setUser: () => null,
  setOcr: () => null,
  setImgIdToMd5Map: () => null,
  updateChar: () => null,
  updateImgId: () => null,
  getCharByImgId: () => null,
  setDefaultChannel: () => null,
  setChannelList: () => null,
};
export const LocalStorageContext = React.createContext<ContextValue>(initValue);

export default function LocalStorageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useLocalStorage<User>(key.user);
  const [ocr, setOcr] = useLocalStorage<Ocr>(key.ocr);
  const [imgIdToMd5Map = {}, setImgIdToMd5Map] = useLocalStorage<
    Record<string, string>
  >(key.imgIdToMd5Map, oldNewKey);

  const [md5ToCharMap = {}, setCharMap] = useLocalStorage<Md5ToCharMap>(
    key.md5ToCharMap,
    imgAndChar
  );
  const updateChar: ContextValue["updateChar"] = (key, newChar, newImg) => {
    md5ToCharMap[key] = {
      char: newChar,
      img: newImg || md5ToCharMap[key].img,
    };
    setCharMap({ ...md5ToCharMap });
    // TODO: 调接口上传
  };
  const updateImgId: ContextValue["updateImgId"] = (imgId, imgMd5) => {
    setImgIdToMd5Map({ ...imgIdToMd5Map, [imgId]: imgMd5 });
    // TODO: 调接口上传
  };
  const getCharByImgId = (imgId: string) => {
    const md5Str = imgIdToMd5Map[imgId];
    const char = (md5ToCharMap[md5Str || ""] as Md5ToCharMap[""]) || undefined;
    return char;
  };

  const [defaultChannel, setDefaultChannel] = useLocalStorage<string>(
    key.defaultChannel
  );
  const [channelList, setChannelList] = useLocalStorage<string[]>(
    key.channelList
  );

  const contextValue: ContextValue = {
    user,
    setUser,
    ocr,
    setOcr,
    imgIdToMd5Map,
    setImgIdToMd5Map,
    md5ToCharMap,
    updateChar,
    updateImgId,
    getCharByImgId,
    defaultChannel,
    setDefaultChannel,
    channelList,
    setChannelList,
  };
  return (
    <LocalStorageContext.Provider value={contextValue}>
      {children}
    </LocalStorageContext.Provider>
  );
}
