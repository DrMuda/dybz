import {
  SpinLoading,
  Mask,
  PullToRefresh,
  Card,
  Button,
  SearchBar,
  Toast,
} from "antd-mobile";
import styled from "@emotion/styled";
import useQuery from "../hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { addBook, searchBookList } from "../services/searchBook";
import { useContext, useState } from "react";
import CenterErrorBlock from "../components/CenterErrorBlock";
import Setting from "../components/Setting";
import { Book } from "../services/home";
import dayjs from "dayjs";
import { dateFormat } from "../config";
import { LocalStorageContext } from "../contexts/LocalStorageContext";

const Bookshelf = styled.div(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, 110px)",
  gridAutoRows: "160px",
  gap: "10px",
  padding: "50px 8px 8px",
  justifyContent: "center",
}));
export default function SearchBook() {
  const { user, defaultChannel } = useContext(LocalStorageContext);
  const [keyword, setKeyword] = useState<string>();
  const { data, refetch, isLoading, isReFetching, error } = useQuery({
    queryKey: [keyword],
    queryFn: async () => {
      if (!keyword) return;
      const res = await searchBookList({ keyword, chanel: "" });
      return res;
    },
  });
  const bookList = data?.data;
  const navigate = useNavigate();

  if (!isLoading && !isReFetching && (bookList?.length || 0) <= 0) {
    return (
      <div className="h-full flex justify-center items-center">
        <CenterErrorBlock status={error ? "busy" : "empty"} />
      </div>
    );
  }
  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="fixed top-0 left-0 w-screen p-2">
        <SearchBar
          placeholder="搜书"
          onSearch={(value) => {
            value && setKeyword(value.trim());
          }}
        />
      </div>
      <div className="fixed top-0 bottom-0 w-screen p-2">
        <Button
          onClick={() => {
            navigate("/");
          }}
          className="m-[0,auto]"
        >
          返回书架
        </Button>
      </div>
      <Bookshelf className="grid">
        {bookList?.map(({ name, url }) => {
          return (
            <Card
              title={<div className="h-[120px]">{name}</div>}
              style={{ boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}
              key={url}
              onClick={() => {
                if (!user || !defaultChannel) {
                  Toast.show("请先设置用户与路线");
                  return;
                }
                const newBook: Book = {
                  chanel: defaultChannel,
                  id: new Date().getTime(),
                  name,
                  url,
                  lastTime: dayjs().format(dateFormat),
                };
                addBook({ ...newBook, user });
                navigate(`/selectChatper?bookId=${newBook.id}`);
              }}
            />
          );
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
      </Bookshelf>
      <Setting />
    </PullToRefresh>
  );
}
