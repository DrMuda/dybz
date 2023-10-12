import { Button, ButtonProps } from "antd-mobile";
import { useState } from "react";

export default function LoadingButton({
  onClick,
  ...props
}: ButtonProps & { onClick?: () => Promise<unknown> }) {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      {...props}
      loading={loading}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await onClick?.();
        setLoading(false);
      }}
    >
      {props.children}
    </Button>
  );
}
