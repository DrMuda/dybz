import { createHashRouter } from "react-router-dom";
import Home from "../pages/Home";
import SearchBook from "../pages/SearchBook";
import SelectChatper from "../pages/SelectChatper";
import CharManage from "../pages/CharManage";
import ReadBook from "../pages/ReadBook";

const router = createHashRouter([
  { path: "/", element: <Home /> },
  { path: "/home", element: <Home /> },
  { path: "/searchBook", element: <SearchBook /> },
  { path: "/selectChatper", element: <SelectChatper /> },
  { path: "/charManage", element: <CharManage /> },
  { path: "/readBook", element: <ReadBook /> },
]);

export default router;
