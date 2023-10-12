import { SpinLoading, Mask, Card, Button, SearchBar, Toast } from "antd-mobile";
import styled from "@emotion/styled";
import { getBookList } from "../services/home";
import useQuery from "../hooks/useQuery";
import { useNavigate } from "react-router-dom";
import CenterErrorBlock from "../components/CenterErrorBlock";
import Setting from "../components/Setting";
import { useContext } from "react";
import { LocalStorageContext } from "../contexts/LocalStorageContext";
import HFullPullRefresh from "../components/HFullPullRefresh";

const Bookshelf = styled.div(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, 110px)",
  gridAutoRows: "160px",
  gap: "10px",
  padding: "50px 8px 8px",
  justifyContent: "center",
}));
export default function Home() {
  const { user } = useContext(LocalStorageContext);
  const { data, refetch, isLoading, isReFetching, error } = useQuery({
    queryKey: [user],
    queryFn: async () => {
      if (!user?.name) {
        Toast.show("请先设置用户");
        return;
      }
      const res = await getBookList({ user });
      return res;
    },
  });
  const bookList = data?.data;
  const navigate = useNavigate();

  if (!isLoading && !isReFetching && (bookList?.length || 0) <= 0) {
    return (
      <HFullPullRefresh onRefresh={refetch}>
        <div className="h-full">
          <div className="h-full flex justify-center items-center">
            <CenterErrorBlock status={error ? "busy" : "empty"} />
          </div>
          <Setting />
        </div>
      </HFullPullRefresh>
    );
  }
  return (
    <HFullPullRefresh onRefresh={refetch}>
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
      <Bookshelf className="grid">
        {bookList?.map(({ name, id, history, url }) => {
          return (
            <Card
              title={<div className="h-[80px]">{name}</div>}
              style={{ boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}
              key={id}
              onClick={() => {
                if (!history) {
                  navigate(`/selectChatper?bookId=${id}`);
                } else {
                  navigate(`/readBook?url=${url}&bookId=${id}`);
                }
              }}
            >
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/selectChatper?bookId=${id}`);
                }}
                color="primary"
              >
                选择
              </Button>
            </Card>
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
    </HFullPullRefresh>
  );
}
