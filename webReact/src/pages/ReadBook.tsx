import { Button, Input, Mask, Modal, SpinLoading, Toast } from "antd-mobile";
import Setting from "../components/Setting";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import classnames from "classnames";
import styled from "@emotion/styled";
import { useLocalStorage } from "react-use";
import { getBookPageContent } from "../services/readBook";
import { localStorageKey } from "../config";
import api from "../services/request";
import md5 from "md5";
import { LocalStorageContext } from "../contexts/LocalStorageContext";
import { useQuery } from "react-query";
import { GetBookPageContentRes } from "../services/serverApiTypes";
import { useHashSearchParams } from "../hooks/useHashSearchParam";
import { editBook, getBookList } from "../services/userBook";

const NavBtn = styled(Button)(() => ({
  width: "100%",
}));
export default function ReadBook() {
  const [navPosition, setNavPosition] = useState<"left" | "right">("left");
  const [pageUrlList, setPageUrlList] = useState<string[]>([]);
  const [bookId] = useHashSearchParams("bookId");
  const [currentPageUrl, setCurrentPageUrl] = useState<string>();
  const [preUrl, setPreUrl] = useState<string>();
  const [nextUrl, setNextUrl] = useState<string>();
  const [cacheBook, setCacheBook, removeCacheBook] = useLocalStorage<
    GetBookPageContentRes["data"]
  >(localStorageKey.cacheBook);
  const [contentList, setContentList] = useState<string[]>();
  const [edittingCharImg, setEdittingCharImg] = useState<string>();
  const { updateChar, updateImgId, imgIdToMd5Map, md5ToCharMap, user } =
    useContext(LocalStorageContext);

  const { data: bookListRes } = useQuery({
    queryKey: ["getBookList"],
    queryFn: async () => {
      const { id, password } = user || {};
      if (!id || !password) {
        Toast.show("请先设置用户");
        return;
      }
      const res = await getBookList({
        userId: id,
        userPassword: password,
      }).catch(() => null);
      return res;
    },
    refetchOnWindowFocus: false,
  });
  // 预请求下一页数据
  const { data: nextPageData, refetch: fetchNextPage } = useQuery({
    queryFn: async () => {
      const currentPageIndex = pageUrlList.findIndex(
        (url) => url === currentPageUrl
      );
      const url =
        currentPageUrl === pageUrlList[pageUrlList.length - 1]
          ? nextUrl
          : pageUrlList[currentPageIndex + 1];

      console.log(currentPageIndex, pageUrlList, currentPageUrl);
      if (!url) return;
      const res = await getBookPageContent({ url }).catch(() => null);
      if (!(res?.status === "success") || !res.data)
        throw "preLoad fail, retry";
      return res.data;
    },
    queryKey: [],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  // 请求当前页数据
  const {
    data,
    refetch: _refetch,
    isLoading,
  } = useQuery({
    queryFn: async () => {
      if (!currentPageUrl) return;
      if (cacheBook?.chapterUrl === currentPageUrl) {
        console.log("use caceh");
        return cacheBook;
      }
      if (nextPageData?.chapterUrl === currentPageUrl) {
        console.log("use preload");
        return nextPageData;
      }

      if (!currentPageUrl) {
        Toast.show("url 异常");
        return null;
      }
      const res = await getBookPageContent({ url: currentPageUrl }).catch(
        () => {
          Toast.show("获取数据失败");
          return null;
        }
      );
      if (!(res?.status === "success") || !res.data) {
        Toast.show("获取数据失败");
        return;
      }
      return res.data;
    },
    queryKey: [currentPageUrl],
    refetchOnWindowFocus: false,
  });

  const currentBook = useMemo(() => {
    return bookListRes?.data?.find(({ id }) => bookId === id?.toString());
  }, [bookListRes]);

  const refetch = () => {
    removeCacheBook();
    setTimeout(() => {
      _refetch();
    });
  };

  useEffect(() => {
    setCurrentPageUrl(currentBook?.historyUrl || currentBook?.url);
  }, [currentBook]);
  useEffect(() => {
    if (!data) return;
    setPageUrlList(data.pageList);
    setNextUrl(data.nextUrl);
    setPreUrl(data.preUrl);
    setContentList(data.contentList);
    data && setCacheBook(data);
    setTimeout(() => {
      fetchNextPage();
    }, 1);

    if (user?.id && user.password && currentBook) {
      editBook({
        book: { ...currentBook, historyUrl: currentPageUrl },
        user: { id: user.id, password: user.password },
      });
    }
  }, [data]);

  const handleDoubleClick = useCallback(() => {
    if (navPosition === "left") {
      setNavPosition("right");
    } else {
      setNavPosition("left");
    }
  }, [navPosition]);
  const checkDoubleClick = useMemo(() => {
    let preClickTime = 0;
    return () => {
      const now = Date.now();
      if (now - preClickTime <= 700) {
        handleDoubleClick();
      }
      preClickTime = now;
    };
  }, [handleDoubleClick]);

  return (
    <div className="h-full overflow-hidden">
      <div
        className={classnames({
          "h-full flex": true,
          "flex-row": navPosition === "left",
          "flex-row-reverse": navPosition === "right",
        })}
      >
        <div className="h-full w-24 flex-shrink-0 flex-grow-0 p-2 shadow-lg flex items-center flex-col gap-2 scale-100 overflow-auto pb-16">
          <NavBtn onClick={() => refetch()}>刷新</NavBtn>
          {preUrl && (
            <NavBtn onClick={() => setCurrentPageUrl(preUrl)}>上一章</NavBtn>
          )}
          {nextUrl && (
            <NavBtn onClick={() => setCurrentPageUrl(nextUrl)}>下一章</NavBtn>
          )}
          {pageUrlList.map((pageUrl, index) => {
            return (
              <NavBtn
                onClick={() => setCurrentPageUrl(pageUrl)}
                color={pageUrl === currentPageUrl ? "primary" : "default"}
              >
                {index + 1}
              </NavBtn>
            );
          })}
        </div>

        <div
          className={classnames({
            "flex-1 h-full scale-100": true,
            "overflow-auto": !isLoading,
            "overflow-hidden": isLoading,
          })}
          onClick={checkDoubleClick}
        >
          {contentList?.map((text, index) => {
            if (text?.match(/^<img>:/)) {
              const src = text.replace(/^<img>:/, "");
              const imgId = src.replace(/^http.*\/\/.*\//, "/") || "";
              const md5Id = imgIdToMd5Map?.[imgId] || "";
              const { char } = md5ToCharMap?.[md5Id] || {};
              if (char) return <span>{char}</span>;
              return (
                <img
                  key={index}
                  src={src}
                  className="h-4 w-4"
                  referrerPolicy="no-referrer"
                  onClick={()=>{setEdittingCharImg(src)}}
                />
              );
            }
            if (text === "<br>") return <br key={index} />;
            return <span key={index}>{text}</span>;
          })}
        </div>

        {isLoading && (
          <Mask
            color="white"
            visible={true}
            className={classnames({
              "!flex justify-center items-center": true,
              "!left-24": navPosition === "left",
              "!left-[-96px]": navPosition === "right",
            })}
            onMaskClick={checkDoubleClick}
          >
            <SpinLoading style={{ "--size": "48px" }} />
          </Mask>
        )}
      </div>
      <Setting position={navPosition} />
      <Modal
        visible={!!edittingCharImg}
        closeOnMaskClick={true}
        onClose={() => {
          setEdittingCharImg(undefined);
        }}
        content={
          <div className="flex gap-1">
            <img src={edittingCharImg} />
            <Input
              onChange={async (value) => {
                const res = await api({
                  url: edittingCharImg,
                  method: "get",
                  responseType: "blob",
                }).catch(() => null);
                if (res instanceof Blob) {
                  const dataUrl = URL.createObjectURL(res);
                  const imgMd5 = md5(dataUrl);
                  updateChar(imgMd5, value, dataUrl);
                  const imgId =
                    edittingCharImg?.replace(/^http.*\/\/.*\//, "/") || "";
                  updateImgId(imgId, imgMd5);
                }
              }}
            />
          </div>
        }
      />
    </div>
  );
}
