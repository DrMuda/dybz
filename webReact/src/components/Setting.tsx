import styled from "@emotion/styled";
import { Button, Radio, Space, Toast } from "antd-mobile";
import { useContext, useState } from "react";
import { AiFillSetting, AiOutlineClose } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import md5 from "md5";
import { useLocalStorage } from "react-use";
import { localStorageKey } from "../config";
import BorderInput from "./BorderInput";
import { LocalStorageContext, Ocr } from "../contexts/LocalStorageContext";

const Container = styled.div(
  ({ open, position }: { open: boolean; position: "left" | "right" }) => ({
    backgroundColor: open ? "white" : "#1890ff",
    position: "fixed",
    left: position === "left" ? "20px" : "unset",
    right: position === "right" ? "20px" : "unset",
    bottom: "20px",
    width: open ? "calc(100% - 40px)" : "32px",
    height: open ? "calc(100% - 40px)" : "32px",
    padding: open ? "8px" : 0,
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
    transition: "all 0.3s",
    borderRadius: "16px",
    ".set-icon": {
      color: "#fff",
      transition: "inherit",
      position: "absolute",
      height: "28px",
      width: "28px",
      left: "2px",
      bottom: "2px",
      transform: open ? "scale(0)" : "scale(1)",
      pointerEvents: open ? "none" : "auto",
    },
    ".close-icon": {
      transition: "inherit",
      position: "absolute",
      right: "8px",
      top: "8px",
      height: open ? "20px" : 0,
      width: open ? "20px" : 0,
      opacity: open ? 1 : 0,
      pointerEvents: open ? "auto" : "none",
    },
    ".main-content": {
      transition: "inherit",
      opacity: open ? 1 : 0,
      pointerEvents: open ? "auto" : "none",
    },
  })
);
const Label = styled.div(() => ({
  flexShrink: 0,
  flexGrow: 0,
  width: "60px",
  textAlign: "right",
  lineHeight: "27px",
  height: "27px",
}));
const ChannelGrid = styled.div(() => ({
  display: "grid",
  flexGrow: 1,
  gridTemplateColumns: "repeat(auto-fill, 80px)",
  gridAutoRows: "30px",
  gap: "4px",
}));

export default function Setting({
  position = "left",
}: {
  position?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {
    user,
    setUser,
    channelList,
    defaultChannel,
    setChannelList,
    setDefaultChannel,
    ocr,
    setOcr,
  } = useContext(LocalStorageContext);
  const [channelPageLink, setChannelPageLink] = useLocalStorage<string>(
    localStorageKey.channelPageLink
  );

  return (
    <div
      className="w-full h-full"
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      <Container open={open} position={position}>
        <AiFillSetting className="set-icon" onClick={() => setOpen(true)} />
        <AiOutlineClose className="close-icon" onClick={() => setOpen(false)} />
        <div className="main-content">
          <div className="text-lg font-bold mb-2">设置</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Label />
              <Button
                color="primary"
                onClick={() => {
                  navigate("/charManage");
                }}
                size="small"
                className="w-30"
              >
                管理字符
              </Button>
            </div>

            <div className="flex gap-1">
              <Label>用户名: </Label>
              <BorderInput
                value={user?.name}
                onChange={(value) => {
                  setUser({ ...user, name: value });
                }}
              />
            </div>

            <div className="flex gap-1">
              <Label>密码: </Label>
              <BorderInput
                type="password"
                onChange={(value) => {
                  setUser({ ...user, password: value && md5(value) });
                }}
              />
            </div>

            <div className="flex gap-1">
              <Label>路线: </Label>
              <div className="w-full">
                <ChannelGrid>
                  {channelList?.map((channel, index) => {
                    const isChecked = channel === defaultChannel;
                    return (
                      <Button
                        key={index}
                        color={isChecked ? "primary" : "default"}
                        onClick={() => {
                          setDefaultChannel(channel);
                        }}
                        size="small"
                      >
                        路线{index + 1}
                      </Button>
                    );
                  })}
                  <Button
                    onClick={() => {
                      if (!channelPageLink) {
                        Toast.show("请设置路线页面url");
                        return;
                      }
                      // TODO: 调接口请求路线
                      setChannelList(["1", "2"]);
                    }}
                    color="primary"
                    size="small"
                  >
                    更新
                  </Button>
                </ChannelGrid>
                <BorderInput
                  className="mt-1"
                  placeholder="路线页面url"
                  value={channelPageLink}
                  onChange={setChannelPageLink}
                />
              </div>
            </div>

            <div className="flex gap-1">
              <Label>启用OCR: </Label>
              <div className="flex-1">
                <Radio.Group
                  value={ocr?.type || null}
                  onChange={(value) => {
                    if (!ocr?.accessToken) {
                      Toast.show("请先设置access_token");
                      return;
                    }
                    setOcr({ ...ocr, type: value as Ocr["type"] });
                  }}
                >
                  <Space direction="vertical">
                    <Radio value="general_basic">百度通用(标准)</Radio>
                    <Radio value="general">百度带位置通用(标准)</Radio>
                    <Radio value="accurate_basic">百度通用(精确)</Radio>
                    <Radio value="accurate">百度带位置通用(精确)</Radio>
                  </Space>
                </Radio.Group>
                <BorderInput
                  placeholder="填写百度OCR access_token"
                  value={ocr?.accessToken}
                  onChange={(value) => {
                    if (!value) {
                      setOcr({ accessToken: undefined, type: undefined });
                    } else {
                      setOcr({ ...ocr, accessToken: value });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
