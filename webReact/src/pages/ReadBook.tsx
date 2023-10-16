import { Button, Input, Mask, Modal, SpinLoading, Toast } from "antd-mobile";
import Setting from "../components/Setting";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import classnames from "classnames";
import styled from "@emotion/styled";
import { useLocalStorage, useSearchParam } from "react-use";
import { useNavigate } from "react-router";
import { getBookPageContent } from "../services/readBook";
import { localStorageKey } from "../config";
import api from "../services/request";
import md5 from "md5";
import { LocalStorageContext } from "../contexts/LocalStorageContext";
import { useQuery } from "react-query";
import { GetBookPageContentRes } from "../services/serverApiTypes";

const NavBtn = styled(Button)(() => ({
  width: "100%",
}));
export default function ReadBook() {
  const navigate = useNavigate();
  const [navPosition, setNavPosition] = useState<"left" | "right">("left");
  const [pageUrlList, setPageUrlList] = useState<string[]>([]);
  const firstPageUrl = useSearchParam("url");
  const bookId = useSearchParam("bookId");
  const [currentPageUrl, setCurrentPageUrl] = useState<string>(
    firstPageUrl || ""
  );
  const [preUrl, setPreUrl] = useState<string>();
  const [nextUrl, setNextUrl] = useState<string>();
  const [cacheBook, setCacheBook, removeCacheBook] = useLocalStorage<
    GetBookPageContentRes["data"]
  >(localStorageKey.cacheBook);
  const [contentList, setContentList] = useState<string[]>();
  const [edittingCharImg, setEdittingCharImg] = useState<string>();
  const { updateChar, updateImgId, imgIdToMd5Map, md5ToCharMap } =
    useContext(LocalStorageContext);

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
      navigate(`?url=${currentPageUrl}&bookId=${bookId}`, { replace: true });
      if (cacheBook?.chapterUrl === currentPageUrl) return cacheBook;
      if (nextPageData?.chapterUrl === currentPageUrl) return nextPageData;

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
      if (!(res?.status === "success") || !res.data) return;
      setCacheBook(res.data);
      const domParser = new DOMParser();
      const doc = domParser.parseFromString(res.message || "", "text/html");
      const neiRong = doc.querySelector(".neirong");
      const neirongChildrenList: Element[] = [];
      const flatDomTree = (dom: Element, level: number) => {
        console.log(dom.tagName, dom?.getAttribute?.("class"), level);
        if (dom?.getAttribute?.("style")?.includes("display: none")) return;
        if (dom.tagName === "DIV") {
          dom.childNodes.forEach((node) => {
            flatDomTree(node as Element, level + 1);
          });
        } else {
          neirongChildrenList.push(dom);
        }
      };
      neiRong && flatDomTree(neiRong, 1);
      console.log(neiRong);
      console.log(neirongChildrenList);

      return res.data;
    },
    queryKey: [currentPageUrl],
    refetchOnWindowFocus: false,
  });

  const refetch = () => {
    removeCacheBook();
    setTimeout(() => {
      _refetch();
    });
  };

  useEffect(() => {
    setPageUrlList(data?.pageList || []);
    setNextUrl(data?.nextUrl);
    setPreUrl(data?.preUrl);
    setContentList(data?.contentList);
    setTimeout(() => {
      fetchNextPage();
    }, 1);
    // TODO: 调接口更新阅读历史记录
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
        <div className="h-full w-24 flex-shrink-0 flex-grow-0 p-2 shadow-lg flex items-center flex-col gap-2 scale-100">
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
          className="flex-1 h-full overflow-auto scale-100"
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
                />
              );
            }
            if (text === "<br>") return <br key={index} />;
            return <span key={index}>{text}</span>;
          })}
          {isLoading && (
            <Mask
              color="white"
              visible={true}
              className="!flex justify-center items-center"
            >
              <SpinLoading style={{ "--size": "48px" }} />
            </Mask>
          )}
        </div>
      </div>
      <Setting position={navPosition} />
      <Modal
        visible={!!edittingCharImg}
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
