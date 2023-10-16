import React, { ReactNode, useState } from "react";

interface ContextValue {
  settingOpen?: boolean;
  setSettingOpen: (open: boolean) => void;
}

const initValue: ContextValue = {
  setSettingOpen: () => null,
};
export const AppContext = React.createContext<ContextValue>(initValue);

export default function AppContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settingOpen, setSettingOpen] = useState(false);

  const contextValue: ContextValue = { settingOpen, setSettingOpen };
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
