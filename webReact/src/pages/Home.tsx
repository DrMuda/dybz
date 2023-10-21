import { SpinLoading, Mask, Card, Button, SearchBar, Toast } from "antd-mobile";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import CenterErrorBlock from "../components/CenterErrorBlock";
import Setting from "../components/Setting";
import { useContext } from "react";
import { LocalStorageContext } from "../contexts/LocalStorageContext";
import HFullPullRefresh from "../components/HFullPullRefresh";
import { useQuery } from "react-query";
import { delBook, getBookList } from "../services/userBook";
import { AppContext } from "../contexts/AppContext";

const Bookshelf = styled.div(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, 130px)",
  gridAutoRows: "160px",
  gap: "10px",
  padding: "50px 8px 8px",
  justifyContent: "center",
}));
export default function Home() {
  const { user } = useContext(LocalStorageContext);
  const { settingOpen } = useContext(AppContext);
  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ["getBookList", settingOpen],
    queryFn: async () => {
      const { id, password } = user || {};
      // 关闭设置时刷新
      if (settingOpen) return;
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
  const bookList = data?.data;
  const navigate = useNavigate();

  const searchBar = (
    <div className="fixed top-0 left-0 w-screen p-2">
      <SearchBar
        placeholder="搜书"
        onSearch={(value) => {
          if (value) {
            navigate(`/searchBook?keyword=${value.trim()}`);
          }
        }}
      />
    </div>
  );

  if (!isLoading && (bookList?.length || 0) <= 0) {
    return (
      <HFullPullRefresh onRefresh={refetch}>
        {searchBar}
        <div className="h-full">
          <div className="h-full flex justify-center items-center">
            <CenterErrorBlock
              status={error ? "busy" : "empty"}
              title="没有书籍"
              description="去搜索添加吧"
            />
          </div>
          <Setting />
        </div>
      </HFullPullRefresh>
    );
  }
  return (
    <HFullPullRefresh onRefresh={refetch}>
      {searchBar}
      <Bookshelf className="grid">
        {bookList
          ?.sort(
            ({ lastUpdate }, { lastUpdate: _lastUpdate }) =>
              new Date(_lastUpdate || "").getTime() -
              new Date(lastUpdate || "").getTime()
          )
          .map(({ name, id }) => {
            return (
              <Card
                title={<div className="h-[80px]">{name}</div>}
                style={{ boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}
                key={id}
                onClick={() => {
                  if (!history) {
                    navigate(`/selectChatper?bookId=${id}`);
                  } else {
                    navigate(`/readBook?bookId=${id}`);
                  }
                }}
              >
                <div className="flex justify-between">
                  <Button
                    size="mini"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/selectChatper?bookId=${id}`);
                    }}
                    color="primary"
                  >
                    章节
                  </Button>
                  <Button
                    size="mini"
                    color="danger"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!user?.id || !user.password) return;
                      const res = await delBook({
                        bookId: id,
                        user: { id: user.id, password: user.password },
                      }).catch(() => null);
                      if (res?.status === "success") {
                        refetch();
                      } else {
                        Toast.show("删除失败");
                      }
                    }}
                  >
                    删除
                  </Button>
                </div>
              </Card>
            );
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
      </Bookshelf>
      <Setting />
    </HFullPullRefresh>
  );
}
