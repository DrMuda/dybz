import { useCallback } from "react";
import { useHash } from 'react-use';
 
// 重载函数签名
interface UseHashSearchParamsType {
  (key: string, defaultValue?: string): readonly [string, (value: any) => void];
  (): readonly [
    Record<string, string>,
    (searchParams: Record<string, any>) => void
  ];
}
 
export const useHashSearchParams: UseHashSearchParamsType = (
  key?: any,
  defaultValue?: any
): any => {
  const [hash, setHash] = useHash();
  const questionIndex = hash.indexOf("?");
  const search = questionIndex !== -1 ? hash.substring(questionIndex) : "";
  // 解析查询参数
  const usp = new URLSearchParams(search);
 
  const hashSearchParams: Record<string, string> = {};
  usp.forEach((value, key) => {
    hashSearchParams[key] = value;
  });
 
  const setHashSearchParams = useCallback(
    (searchParams: Record<string, any>) => {
      const searchPrefix =
        (questionIndex !== -1 ? hash.slice(0, questionIndex) : hash.slice(0)) +
        "?";
      // 拼接查询参数，并进行编码处理
      const search = Object.keys(searchParams).reduce((finalSearch, key) => {
        if (finalSearch) finalSearch += "&";
        const value = String(searchParams[key]);
        finalSearch += encodeURIComponent(key);
        // remove '=' if param with empty value
        if (value) {
          finalSearch += "=" + encodeURIComponent(value);
        }
        return finalSearch;
      }, "");
      setHash(searchPrefix + search);
    },
    [hash, questionIndex, setHash]
  );
 
  if (key) {
    return [
      hashSearchParams[key] === undefined
        ? defaultValue
        : hashSearchParams[key],
      (value: any) =>
        setHashSearchParams({ ...hashSearchParams, [key]: String(value) }),
    ];
  } else {
    return [hashSearchParams, setHashSearchParams];
  }
};
