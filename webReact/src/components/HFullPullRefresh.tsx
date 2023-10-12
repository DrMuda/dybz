import styled from "@emotion/styled";
import { PullToRefresh, PullToRefreshProps } from "antd-mobile";

const PullRefreshContain = styled.div(() => ({
  height: "100%",
  ".adm-pull-to-refresh": {
    height: "100%",
    ".adm-pull-to-refresh-content": {
      height: "100%",
    },
  },
}));
export default function HFullPullRefresh(props: PullToRefreshProps) {
  return (
    <PullRefreshContain>
      <PullToRefresh {...props} />
    </PullRefreshContain>
  );
}
