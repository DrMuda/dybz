import { SearchBar, Tabs } from "antd-mobile";
import BorderInput from "../components/BorderInput";
import styled from "@emotion/styled";
import { useContext, useState } from "react";
import { LocalStorageContext } from "../contexts/LocalStorageContext";

const ScrollTabs = styled(Tabs)(() => ({
  ".adm-tabs-content": {
    boxSizing: "border-box",
    // 45px: 头部选项的高度
    height: "calc(100% - 45px)",
    overflow: "auto",
  },
}));
enum CharType {
  All,
  Normal,
  NoChar,
  /** 非单个中文 */
  Abnormal,
}
export default function CharManage() {
  const { md5ToCharMap = {}, updateChar } = useContext(LocalStorageContext);
  const [keywordFilteredKeyList, setKeywordFilteredKeyList] =
    useState<string[]>();
  const [charTypeFilteredKeyList, setCharTypeFilteredKeyList] =
    useState<string[]>();
  const generateCharList = () => {
    return Object.entries(md5ToCharMap).map(([key, { char, img }]) => {
      let shouldShow = true;
      if (charTypeFilteredKeyList) {
        if (!charTypeFilteredKeyList.includes(key)) shouldShow = false;
      }
      if (keywordFilteredKeyList) {
        if (!keywordFilteredKeyList.includes(key)) shouldShow = false;
      }
      return (
        <div
          key={key}
          className="items-center gap-2 py-1"
          style={{ display: shouldShow ? "flex" : "none" }}
        >
          <img src={img} className="w-7 h-7" />
          <BorderInput
            value={char}
            onChange={(value) => {
              updateChar(key, value);
            }}
          />
        </div>
      );
    });
  };
  const onChangeTab = (type: CharType) => {
    const newList: string[] = [];
    Object.entries(md5ToCharMap).forEach(([key, { char }]) => {
      let shouldShow = true;
      switch (type) {
        case CharType.All:
          break;
        case CharType.Normal: {
          if (!char) shouldShow = false;
          break;
        }
        case CharType.NoChar: {
          if (char) shouldShow = false;
          break;
        }
        case CharType.Abnormal: {
          // 匹配单个中文
          const testReg = new RegExp("^[\u4e00-\u9fa5]$");
          if (testReg.test(char)) shouldShow = false;
          break;
        }
        default: {
          shouldShow = false;
        }
      }
      if (shouldShow) newList.push(key);
    });
    setCharTypeFilteredKeyList(newList);
  };

  return (
    <div className="h-full">
      <ScrollTabs
        className="h-full pt-10"
        onChange={(_key) => {
          const key = parseInt(_key) as CharType;
          onChangeTab(key);
        }}
      >
        <Tabs.Tab title="全部" key={CharType.All}>
          {generateCharList()}
        </Tabs.Tab>
        <Tabs.Tab title="已识别" key={CharType.Normal}>
          {generateCharList()}
        </Tabs.Tab>
        <Tabs.Tab title="未识别" key={CharType.NoChar}>
          {generateCharList()}
        </Tabs.Tab>
        <Tabs.Tab title="异常值" key={CharType.Abnormal}>
          {generateCharList()}
        </Tabs.Tab>
      </ScrollTabs>
      <div className="fixed top-0 left-0 p-2 px-6 w-full bg-white">
        <SearchBar
          placeholder="查找字符"
          onSearch={(value) => {
            if (!value) {
              setKeywordFilteredKeyList(undefined);
              return;
            }
            const newKeyList: string[] = [];
            Object.entries(md5ToCharMap).forEach(([key, { char }]) => {
              if (char === value) {
                newKeyList.push(key);
              }
            });
            setKeywordFilteredKeyList(newKeyList);
          }}
          onClear={() => {
            setKeywordFilteredKeyList(undefined);
          }}
        />
      </div>
    </div>
  );
}
