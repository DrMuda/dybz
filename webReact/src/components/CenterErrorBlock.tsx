import styled from "@emotion/styled";
import { ErrorBlock } from "antd-mobile";

const CenterErrorBlock = styled(ErrorBlock)(() => ({
  svg: {
    margin: "0 auto",
  },
}));

export default CenterErrorBlock;
