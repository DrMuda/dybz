import { Button, Input, Mask, Modal, SpinLoading, Toast } from "antd-mobile";
import Setting from "../components/Setting";
import useQuery from "../hooks/useQuery";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import classnames from "classnames";
import styled from "@emotion/styled";
import { useLocalStorage, useSearchParam } from "react-use";
import { useNavigate } from "react-router";
import { BookPageContent, getBookPageContent } from "../services/readBook";
import { localStorageKey } from "../config";
import api from "../services/request";
import md5 from "md5";
import { LocalStorageContext } from "../contexts/LocalStorageContext";

const NavBtn = styled(Button)(() => ({
  width: "100%",
}));
export default function ReadBook() {
  const navigate = useNavigate();
  const [navPosition, setNavPosition] = useState<"left" | "right">("left");
  const [pageUrlList, setPageUrlList] = useState<string[]>([]);
  const currentChatperUrl = useSearchParam("url");
  const bookId = useSearchParam("bookId");
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
  const [preChatperUrl, setPreChatperUrl] = useState<string>();
  const [nextChatperUrl, setNextChatperUrl] = useState<string>();
  const [cacheBook, setCacheBook] = useLocalStorage<BookPageContent>(
    localStorageKey.cacheBook
  );
  const [content, setContent] = useState<string[]>();
  const [edittingCharImg, setEdittingCharImg] = useState<string>();
  const { updateChar, updateImgId, imgIdToMd5Map, md5ToCharMap } =
    useContext(LocalStorageContext);

  // 预请求下一页数据
  const { data: nextPageData } = useQuery({
    queryFn: async () => {
      const url =
        currentPageIndex >= pageUrlList.length
          ? nextChatperUrl
          : pageUrlList[currentPageIndex + 1];
      if (!url) return;
      const res = await getBookPageContent(url).catch(() => null);
      if (!(res?.code === 0) || !res.data) throw "preLoad fail, retry";
      return res.data;
    },
    queryKey: [currentChatperUrl, currentPageIndex, nextChatperUrl],
  });
  // 请求当前页数据
  const { data, refetch, isLoading, isReFetching } = useQuery({
    queryFn: async () => {
      if (cacheBook?.chatperUrl === currentChatperUrl) return cacheBook;
      if (nextPageData?.chatperUrl === currentChatperUrl) return nextPageData;

      const url =
        currentPageIndex === 0
          ? currentChatperUrl
          : pageUrlList[currentPageIndex];
      if (!url) {
        Toast.show("url 异常");
        return null;
      }
      const res = await getBookPageContent(url).catch(() => {
        Toast.show("获取数据失败");
        return null;
      });
      if (!(res?.code === 0) || !res.data) return;
      setCacheBook(res.data);
      return res.data;
    },
    queryKey: [currentChatperUrl, currentPageIndex],
  });

  useEffect(() => {
    setPageUrlList(data?.pageUrlList || []);
    setNextChatperUrl(data?.nextChatperUrl);
    setPreChatperUrl(data?.preChatperUrl);
    setContent(data?.content);
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
          <NavBtn onClick={refetch}>刷新</NavBtn>
          {preChatperUrl && (
            <NavBtn
              onClick={() => navigate(`?url=${preChatperUrl}&bookId=${bookId}`)}
            >
              上
            </NavBtn>
          )}
          {nextChatperUrl && (
            <NavBtn
              onClick={() =>
                navigate(`?url=${nextChatperUrl}&bookId=${bookId}`)
              }
            >
              下
            </NavBtn>
          )}
          {pageUrlList.map((_, index) => {
            return (
              <NavBtn
                onClick={() => setCurrentPageIndex(index)}
                color={currentPageIndex === index ? "primary" : "default"}
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
          {content?.map((text) => {
            if (text.match(/^img:/)) {
              const src = text.replace(/^img:/, "");
              const imgId = src.replace(/^http.*\/\/.*\//, "/") || "";
              const md5Id = imgIdToMd5Map?.[imgId] || "";
              const { char } = md5ToCharMap?.[md5Id] || {};
              if (char) return <span>{char}</span>;
              return <img src={src} className="h-4 w-4" />;
            }
            return <span>{text}</span>;
          })}
          {(isLoading || isReFetching) && (
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
