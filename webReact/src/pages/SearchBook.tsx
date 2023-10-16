/* eslint-disable react-hooks/exhaustive-deps */
import {
  SpinLoading,
  Mask,
  Card,
  SearchBar,
  Toast,
  Stepper,
} from "antd-mobile";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { searchBookList } from "../services/searchBook";
import { useContext, useEffect, useState } from "react";
import CenterErrorBlock from "../components/CenterErrorBlock";
import Setting from "../components/Setting";
import dayjs from "dayjs";
import { dateFormat } from "../config";
import { LocalStorageContext } from "../contexts/LocalStorageContext";
import { useSearchParam } from "react-use";
import HFullPullRefresh from "../components/HFullPullRefresh";
import { useQuery } from "react-query";
import { Book } from '../types';
import { editBook } from '../services/userBook';

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
  const defauleKeyword = useSearchParam("keyword") || "";
  const [keyword, setKeyword] = useState<string>(defauleKeyword);
  const [pagination, setPagination] = useState({ page: 1, totalPage: 1 });

  const { data, isLoading, refetch, error } = useQuery(
    ["searchBook", keyword, pagination.page],
    async () => {
      if (!keyword || !defaultChannel) return;
      const res = await searchBookList({
        keyword,
        channel: defaultChannel,
        page: pagination.page,
      });
      return res;
    },
    { refetchOnWindowFocus: false }
  );

  const { bookList, totalPage } = data?.data || {};
  const navigate = useNavigate();

  useEffect(() => {
    setPagination({ ...pagination, totalPage: totalPage || 1 });
  }, [totalPage]);

  const searchBar = (
    <div className="fixed top-0 left-0 w-screen p-2 bg-white z-10">
      <SearchBar
        placeholder="搜书"
        defaultValue={keyword}
        onSearch={(value) => {
          value && setKeyword(value.trim());
        }}
      />
    </div>
  );

  if (!isLoading && (bookList?.length || 0) <= 0) {
    return (
      <HFullPullRefresh onRefresh={refetch}>
        {searchBar}
        <div className="h-full flex justify-center items-center">
          <CenterErrorBlock status={error ? "busy" : "empty"} />
        </div>
        <Setting />
      </HFullPullRefresh>
    );
  }
  return (
    <HFullPullRefresh onRefresh={refetch}>
      {searchBar}
      <Bookshelf className="grid">
        {bookList?.map(({ name, url }) => {
          return (
            <Card
              title={<div className="h-[120px]">{name}</div>}
              style={{ boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}
              key={url}
              onClick={() => {
                const { id, password } = user || {};
                if (!id || !password || !defaultChannel) {
                  Toast.show("请先设置用户与路线");
                  return;
                }
                const newBook: Book = {
                  id: new Date().getTime(),
                  name,
                  url,
                  lastUpdate: dayjs().format(dateFormat),
                };
                editBook({ user: { id, password }, book: newBook });
                navigate(`/selectChatper?bookId=${newBook.id}`);
              }}
            />
          );
        })}
      </Bookshelf>
      {isLoading && (
        <Mask
          color="white"
          visible={true}
          className="!flex justify-center items-center"
        >
          <SpinLoading style={{ "--size": "48px" }} />
        </Mask>
      )}
      {(bookList?.length || 0) > 0 && (
        <div className="flex justify-end items-center gap-1 mt-1 px-5 pb-2">
          <span> total: {totalPage}</span>
          <Stepper
            value={pagination.page}
            min={1}
            max={pagination.totalPage}
            onChange={(value) => {
              setPagination({ ...pagination, page: value });
            }}
          />
        </div>
      )}
      <Setting />
    </HFullPullRefresh>
  );
}
