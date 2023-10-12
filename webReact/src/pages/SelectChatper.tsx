import {
  Dropdown,
  Mask,
  PullToRefresh,
  Radio,
  Space,
  SpinLoading,
  Stepper,
} from "antd-mobile";
import { useContext, useEffect, useMemo, useState } from "react";
import Setting from "../components/Setting";
import { useNavigate } from "react-router-dom";
import { getBookList } from "../services/home";
import useQuery from "../hooks/useQuery";
import { getBookChatperList, updateBook } from "../services/selectChatper";
import CenterErrorBlock from "../components/CenterErrorBlock";
import dayjs from "dayjs";
import { dateFormat } from "../config";
import { PaginationCofig } from "../services/request";
import { LocalStorageContext } from "../contexts/LocalStorageContext";

export default function SelectChatper() {
  const [pagination, setPagination] = useState<PaginationCofig>({
    page: 1,
    pageSize: 100,
    total: 0,
  });
  const { page, pageSize } = pagination;
  const { user, channelList, defaultChannel } = useContext(LocalStorageContext);
  const navigate = useNavigate();
  const { data: bookRes } = useQuery({
    queryKey: [user],
    queryFn: async () => {
      if (!user) return;
      const res = await getBookList({ user });
      return res;
    },
  });
  const bookId = useMemo(() => {
    const searchParams = new URLSearchParams(location.href);
    return searchParams.get("bookId");
  }, []);
  const currentBook = useMemo(() => {
    return bookRes?.data.find(({ id }) => id === parseInt(bookId || ""));
  }, [bookRes?.data, bookId]);
  const [tempChannel, setTempChannel] = useState<string>(defaultChannel || "");

  const {
    data: chatperListRes,
    isLoading,
    isReFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: [currentBook],
    queryFn: async () => {
      if (!currentBook?.url) return;
      const res = await getBookChatperList({
        bookUrl: currentBook.url,
        page,
        pageSize,
      });
      return res;
    },
  });
  const { total = 0 } = chatperListRes?.data || {};
  const chatperList = chatperListRes?.data.records || [
    { title: "chatper1", url: "1" },
    { title: "chatper2", url: "2" },
    { title: "chatper3", url: "3" },
  ];

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tempChannel, bookId]);

  return (
    <PullToRefresh onRefresh={refetch}>
      <div
        className="fixed top-0 left-0 w-screen p-2 flex bg-white"
        style={{ borderBottom: "1px solid #dfdfdf" }}
      >
        <span
          className="flex-1 text-lg font-bold"
          style={{ lineHeight: "44px" }}
        >
          bookName
        </span>
        <Dropdown className="w-36">
          <Dropdown.Item key="sorter" title="lockChannel">
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
                      channel {index + 1}
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
                    if (user) {
                      updateBook({
                        user,
                        ...currentBook,
                        chanel: tempChannel,
                        lastTime: dayjs().format(dateFormat),
                      });
                    }
                    navigate(`/readBook?url=${url}&boookId=${currentBook?.id}`);
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
            <span> total: {total}</span>
            <Stepper
              value={page}
              min={1}
              max={Math.round(total / pageSize + 1)}
              onChange={(value) => {
                setPagination({ ...pagination, page: value });
              }}
            />
          </div>
        )}
      </div>
      {(isLoading || isReFetching) && (
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
