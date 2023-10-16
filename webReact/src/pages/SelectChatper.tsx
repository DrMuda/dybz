import {
  Dropdown,
  Mask,
  PullToRefresh,
  Radio,
  Space,
  SpinLoading,
  Stepper,
  Toast,
} from "antd-mobile";
import { useContext, useEffect, useMemo, useState } from "react";
import Setting from "../components/Setting";
import { useNavigate } from "react-router-dom";
import { getChatperList } from "../services/selectChatper";
import CenterErrorBlock from "../components/CenterErrorBlock";
import { PaginationCofig } from "../services/request";
import { LocalStorageContext } from "../contexts/LocalStorageContext";
import { useQuery } from "react-query";
import { editBook, getBookList } from "../services/userBook";
import { dateFormat } from "../config";
import dayjs from "dayjs";
import { parseUrl } from "../utils";
import { useHashSearchParams } from "../hooks/useHashSearchParam";

export default function SelectChatper() {
  const [bookId] = useHashSearchParams("bookId");
  const [pagination, setPagination] = useState<PaginationCofig>({
    page: 1,
    // 无用属性
    pageSize: 10000,
    total: 0,
  });
  const { user, channelList } = useContext(LocalStorageContext);
  const navigate = useNavigate();
  const { data: bookRes } = useQuery({
    queryKey: [user],
    queryFn: async () => {
      if (!user?.id || !user?.password) return;
      const res = await getBookList({
        userId: user.id,
        userPassword: user.password,
      }).catch(() => null);
      return res;
    },
    refetchOnWindowFocus: false,
  });
  const currentBook = useMemo(() => {
    return bookRes?.data?.find(({ id }) => id === parseInt(bookId || ""));
  }, [bookRes?.data, bookId]);
  const [tempChannel, setTempChannel] = useState<string>();

  const {
    data: chatperListRes,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: [tempChannel, pagination.page],
    queryFn: async () => {
      if (!currentBook?.url) return;
      const { path, search } = parseUrl(currentBook.url);
      const res = await getChatperList({
        url: [tempChannel, path, search].join(""),
        page: pagination.page,
      });
      return res;
    },
    refetchOnWindowFocus: false,
    retry: 0,
  });
  const { totalPage = 1, chatperList = [] } = chatperListRes?.data || {};
  useEffect(() => {
    setPagination({ ...pagination, total: pagination.pageSize * totalPage });
  }, [totalPage]);

  useEffect(() => {
    if (!currentBook?.url) return;
    const { domian } = parseUrl(currentBook.url);
    if (domian) setTempChannel(domian);
  }, [currentBook?.url]);

  return (
    <PullToRefresh onRefresh={refetch}>
      <div
        className="fixed top-0 left-0 w-screen p-2 flex bg-white"
        style={{ borderBottom: "1px solid #dfdfdf" }}
      >
        <span
          className="flex-1 text-lg font-bold whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ lineHeight: "44px" }}
        >
          {currentBook?.name}
        </span>
        <Dropdown className="w-36">
          <Dropdown.Item key="sorter" title="锁定路线">
            <Radio.Group
              value={tempChannel}
              onChange={(value) => {
                setTempChannel(value as string);
              }}
            >
              <Space direction="vertical">
                {channelList?.map((channel, index) => {
                  return (
                    <Radio key={channel} value={channel}>
                      路线 {index + 1}
                    </Radio>
                  );
                })}
              </Space>
            </Radio.Group>
          </Dropdown.Item>
        </Dropdown>
      </div>
      <div className="flex flex-col justify-between pt-16">
        {chatperList.length <= 0 && (
          <div className=" flex justify-center items-center">
            <CenterErrorBlock status={error ? "busy" : "empty"} />
          </div>
        )}
        {chatperList.length > 0 && (
          <div>
            {chatperList.map(({ title, url }, index) => {
              return (
                <p
                  key={index}
                  onClick={() => {
                    if (!user?.id || !user?.password) {
                      Toast.show("请先设置用户");
                      return;
                    }
                    if (!currentBook?.url) return;
                    const { search, path } = parseUrl(currentBook.url);
                    const clickedUrl = [tempChannel, url].join("");
                    editBook({
                      user: {
                        id: user.id,
                        password: user.password,
                      },
                      book: {
                        ...currentBook,
                        url: [tempChannel, search, path].join(""),
                        historyUrl: clickedUrl,
                        lastUpdate: dayjs().format(dateFormat),
                      },
                    })
                      .then(() => {
                        navigate(`/readBook?bookId=${currentBook?.id}`);
                      })
                      .catch((error) => {
                        Toast.show(error);
                      });
                  }}
                  className="p-2"
                  style={{ borderBottom: "1px solid #dfdfdf" }}
                >
                  {title}
                </p>
              );
            })}
          </div>
        )}
        {chatperList.length > 0 && (
          <div className="flex justify-end items-center gap-1 mt-1">
            <span> total: {totalPage}</span>
            <Stepper
              value={pagination.page}
              min={1}
              max={totalPage}
              onChange={(value) => {
                setPagination({ ...pagination, page: value });
              }}
            />
          </div>
        )}
      </div>
      {isLoading && (
        <Mask
          color="white"
          visible={true}
          className="!flex justify-center items-center"
        >
          <SpinLoading style={{ "--size": "48px" }} />
        </Mask>
      )}
      <Setting />
    </PullToRefresh>
  );
}
